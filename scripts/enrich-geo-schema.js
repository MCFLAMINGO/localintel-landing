#!/usr/bin/env node
/**
 * One-shot enricher: add static FAQPage + BreadcrumbList schema (and noscript FAQ)
 * to existing zip/ and neighborhood/ stubs without re-fetching Railway.
 *
 * Safe to re-run — skips files that already contain FAQPage in the head.
 *
 * Run: node scripts/enrich-geo-schema.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function patchZip(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('"@type":"FAQPage"') || html.includes('"@type": "FAQPage"')) {
    return false;
  }

  const cfg = html.match(/window\.ZIP_CONFIG\s*=\s*\{([^}]+)\}/);
  if (!cfg) return false;

  const zipM = cfg[1].match(/zip:'([^']+)'/);
  const nameM = cfg[1].match(/name:("(?:\\.|[^"])*"|'(?:\\.|[^'])*')/);
  const countyM = cfg[1].match(/county:("(?:\\.|[^"])*"|'(?:\\.|[^'])*')/);
  if (!zipM || !nameM || !countyM) return false;

  const zip = zipM[1];
  const city = JSON.parse(nameM[1].startsWith("'") ? nameM[1].replace(/^'|'$/g, '"').replace(/\\'/g, "'") : nameM[1]);
  const county = JSON.parse(countyM[1].startsWith("'") ? countyM[1].replace(/^'|'$/g, '"').replace(/\\'/g, "'") : countyM[1]);
  const url = `https://www.thelocalintel.com/zip/${zip}`;

  const bizMatch = html.match(/with ([\d,]+) verified businesses/);
  const bizPhrase = bizMatch ? `${bizMatch[1]} verified businesses` : 'verified local businesses';

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'LocalIntel', item: 'https://www.thelocalintel.com/' },
      { '@type': 'ListItem', position: 2, name: 'Florida markets', item: 'https://www.thelocalintel.com/#explore' },
      { '@type': 'ListItem', position: 3, name: `${city} ${zip}`, item: url },
    ],
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How do I find local services in ${city}, FL ${zip}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Use LocalIntel to find restaurants, plumbers, doctors, and other local services in ${city}, Florida ZIP ${zip}. LocalIntel indexes ${bizPhrase} in this market and routes requests to verified businesses.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is LocalIntel’s coverage for ${city} (${zip})?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${city} is in ${county} County, Florida. LocalIntel tracks ${bizPhrase} in ZIP ${zip}. Browse this market at ${url}.`,
        },
      },
      {
        '@type': 'Question',
        name: `How can a ${city} business get listed on LocalIntel?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Claim your free listing at https://www.thelocalintel.com/claim.html. Verified ${city} businesses receive priority routing when AI agents and customers need local services in ZIP ${zip}.`,
        },
      },
    ],
  };

  const inject =
    `<link rel="alternate" type="text/plain" title="LLM guidance" href="https://www.thelocalintel.com/llms.txt">\n` +
    `  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>\n` +
    `  <script type="application/ld+json">${JSON.stringify(faq)}</script>\n` +
    `</head>`;

  if (!html.includes('</head>')) return false;
  html = html.replace('</head>', inject);

  if (html.includes('<noscript>') && !html.includes('<h2>FAQ</h2>')) {
    html = html.replace(
      /(<noscript>[\s\S]*?)(<p><a href="https:\/\/www\.thelocalintel\.com">← Back to LocalIntel<\/a><\/p>)/,
      `$1<h2>FAQ</h2>\n      <p><strong>How do I find local services in ${esc(city)}?</strong> Search LocalIntel or open this ZIP page to connect with verified businesses in ${esc(zip)}.</p>\n      <p><strong>How do I claim my ${esc(city)} listing?</strong> Visit <a href="https://www.thelocalintel.com/claim.html">Claim Your Listing</a> — free, no subscription.</p>\n      <p><a href="https://www.thelocalintel.com">← Back to LocalIntel</a> · <a href="https://www.thelocalintel.com/llms.txt">llms.txt</a></p>`
    );
  }

  fs.writeFileSync(filePath, html);
  return true;
}

function patchNeighborhood(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('"@type":"FAQPage"') || html.includes('"@type": "FAQPage"')) {
    return false;
  }

  const cfg = html.match(/window\.NEIGHBORHOOD_CONFIG\s*=\s*(\{[\s\S]*?\});/);
  if (!cfg) return false;

  let n;
  try { n = JSON.parse(cfg[1]); } catch { return false; }
  if (!n.slug || !n.name || !n.city) return false;

  const url = `https://www.thelocalintel.com/neighborhood/${n.slug}`;
  const county = n.county || 'Florida';

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'LocalIntel', item: 'https://www.thelocalintel.com/' },
      { '@type': 'ListItem', position: 2, name: 'Neighborhoods', item: 'https://www.thelocalintel.com/#explore' },
      { '@type': 'ListItem', position: 3, name: `${n.name}, ${n.city}`, item: url },
    ],
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What local business intelligence does LocalIntel have for ${n.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${n.name} is a neighborhood in ${n.city}, ${county} County, Florida. LocalIntel provides market signals, sector gaps, and routes job requests to verified businesses serving ${n.name}.`,
        },
      },
      {
        '@type': 'Question',
        name: `How do I find services in ${n.name}, ${n.city}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Open ${url} or search at https://www.thelocalintel.com/search.html. LocalIntel matches requests to verified local businesses in ${n.name}.`,
        },
      },
      {
        '@type': 'Question',
        name: `How can a business in ${n.name} get listed?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Claim a free listing at https://www.thelocalintel.com/claim.html to receive priority routing from AI agents and customers searching in ${n.city}.`,
        },
      },
    ],
  };

  const inject =
    `<link rel="alternate" type="text/plain" title="LLM guidance" href="https://www.thelocalintel.com/llms.txt">\n` +
    `  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>\n` +
    `  <script type="application/ld+json">${JSON.stringify(faq)}</script>\n` +
    `</head>`;

  html = html.replace('</head>', inject);

  if (html.includes('<noscript>') && !html.includes('<h2>FAQ</h2>')) {
    html = html.replace(
      /(<noscript>[\s\S]*?)(<p><a href="https:\/\/www\.thelocalintel\.com">← Back to LocalIntel<\/a><\/p>)/,
      `$1<h2>FAQ</h2>\n      <p><strong>What coverage does LocalIntel have for ${esc(n.name)}?</strong> Market signals and verified business routing for ${esc(n.name)} in ${esc(n.city)}, FL.</p>\n      <p><strong>How do I claim my listing?</strong> Visit <a href="https://www.thelocalintel.com/claim.html">Claim Your Listing</a>.</p>\n      <p><a href="https://www.thelocalintel.com">← Back to LocalIntel</a> · <a href="https://www.thelocalintel.com/llms.txt">llms.txt</a></p>`
    );
  }

  fs.writeFileSync(filePath, html);
  return true;
}

function runDir(dir, patcher, label) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && !f.startsWith('_'));
  let updated = 0;
  for (const f of files) {
    if (patcher(path.join(dir, f))) updated++;
  }
  console.log(`${label}: updated ${updated}/${files.length}`);
}

runDir(path.join(ROOT, 'zip'), patchZip, 'ZIP stubs');
runDir(path.join(ROOT, 'neighborhood'), patchNeighborhood, 'Neighborhood stubs');
console.log('Done.');
