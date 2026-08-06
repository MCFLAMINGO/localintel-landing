#!/usr/bin/env node
/**
 * generate-neighborhood-pages.js — LocalIntel Neighborhood Stub Generator
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches all neighborhoods from Railway (/api/local-intel/neighborhoods),
 * generates a 20-line stub HTML file for each one under neighborhood/SLUG.html.
 *
 * Each stub: SEO metadata + window.NEIGHBORHOOD_CONFIG + loads _neighborhood-page.js
 * To update ALL pages: edit _neighborhood-page.js and deploy.
 * Re-run this generator when adding new neighborhoods to Postgres.
 *
 * Run: node generate-neighborhood-pages.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');

const RAILWAY = 'https://gsb-swarm-production.up.railway.app';
const HOOD_DIR = path.join(__dirname, 'neighborhood');
const SEED_PATH = path.join(__dirname, 'jaxNeighborhoodsSeed.json');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

function stubHTML(n) {
  const title = `${n.name}, ${n.city} — Local Business Intelligence | LocalIntel`;
  const desc  = `Live business intelligence for ${n.name} in ${n.city}, FL. ` +
    `Market signals, sector gaps, and business data for this ${n.city} neighborhood. ` +
    `LocalIntel routes job requests to verified businesses in ${n.name}.`;
  const url   = `https://www.thelocalintel.com/neighborhood/${n.slug}`;
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `${n.name} Business Intelligence`,
    "description": desc,
    "url": url,
    "provider": { "@type": "Organization", "name": "LocalIntel", "url": "https://www.thelocalintel.com" },
    "spatialCoverage": { "@type": "Place", "name": `${n.name}, ${n.city}, ${n.county} County, FL` }
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "LocalIntel", "item": "https://www.thelocalintel.com/" },
      { "@type": "ListItem", "position": 2, "name": "Neighborhoods", "item": "https://www.thelocalintel.com/#explore" },
      { "@type": "ListItem", "position": 3, "name": `${n.name}, ${n.city}`, "item": url }
    ]
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What local business intelligence does LocalIntel have for ${n.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${n.name} is a neighborhood in ${n.city}, ${n.county} County, Florida. LocalIntel provides market signals, sector gaps, and routes job requests to verified businesses serving ${n.name}.`
        }
      },
      {
        "@type": "Question",
        "name": `How do I find services in ${n.name}, ${n.city}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Open ${url} or search at https://www.thelocalintel.com/search.html. LocalIntel matches requests to verified local businesses in ${n.name}.`
        }
      },
      {
        "@type": "Question",
        "name": `How can a business in ${n.name} get listed?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Claim a free listing at https://www.thelocalintel.com/claim.html to receive priority routing from AI agents and customers searching in ${n.city}.`
        }
      }
    ]
  };
  const evergreen = `${n.name} is a neighborhood in ${n.city}, ${n.county} County, Florida. ` +
    `LocalIntel routes live service requests, RFQ jobs, and agentic task queries to verified ` +
    `businesses operating in ${n.name}. Businesses with an active profile and digital wallet ` +
    `receive priority routing from AI agents and local customers searching in ${n.city}.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <meta property="og:title" content="${n.name}, ${n.city} — Local Business Intelligence">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="LocalIntel">
  <link rel="canonical" href="${url}">
  <link rel="alternate" type="text/plain" title="LLM guidance" href="https://www.thelocalintel.com/llms.txt">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%2316A34A'/><circle cx='16' cy='16' r='6' fill='white'/></svg>">
  <script type="application/ld+json">${JSON.stringify(datasetSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
</head>
<body>
  <noscript>
    <div style="font-family:sans-serif;max-width:680px;margin:40px auto;padding:0 20px;">
      <h1>${n.name}, ${n.city} — Local Business Intelligence</h1>
      <p>${evergreen}</p>
      <h2>FAQ</h2>
      <p><strong>What coverage does LocalIntel have for ${n.name}?</strong> Market signals and verified business routing for ${n.name} in ${n.city}, FL.</p>
      <p><strong>How do I claim my listing?</strong> Visit <a href="https://www.thelocalintel.com/claim.html">Claim Your Listing</a>.</p>
      <p><a href="https://www.thelocalintel.com">← Back to LocalIntel</a> · <a href="https://www.thelocalintel.com/llms.txt">llms.txt</a></p>
    </div>
  </noscript>
  <script>
    window.NEIGHBORHOOD_CONFIG = ${JSON.stringify({ slug: n.slug, name: n.name, city: n.city, county: n.county, region: n.region || '', zips: n.zip_codes || [] })};
  </script>
  <script src="/_neighborhood-page.js"></script>
</body>
</html>`;
}

async function main() {
  console.log('[generate-neighborhood-pages] Fetching neighborhoods from Railway...');

  let neighborhoods = [];
  try {
    // Fetch all cities — start with Jacksonville
    const cities = ['Jacksonville'];
    for (const city of cities) {
      const data = await fetchJSON(`${RAILWAY}/api/local-intel/neighborhoods?city=${encodeURIComponent(city)}`);
      neighborhoods = neighborhoods.concat(data.neighborhoods || []);
      console.log(`  ${city}: ${(data.neighborhoods||[]).length} neighborhoods`);
    }
  } catch (e) {
    console.warn(`[generate-neighborhood-pages] Railway fetch failed (${e.message}), using local seed`);
    try {
      const seed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
      neighborhoods = seed;
      console.log(`  Local seed: ${neighborhoods.length} neighborhoods`);
    } catch (e2) {
      console.error('[generate-neighborhood-pages] No seed available.');
      process.exit(1);
    }
  }

  if (!fs.existsSync(HOOD_DIR)) fs.mkdirSync(HOOD_DIR);

  let written = 0;
  for (const n of neighborhoods) {
    if (!n.slug || !n.name) continue;
    const html = stubHTML(n);
    fs.writeFileSync(path.join(HOOD_DIR, `${n.slug}.html`), html, 'utf8');
    written++;
  }

  console.log(`[generate-neighborhood-pages] Done. ${written} stubs written to neighborhood/`);

  // Write city index for Explore section on index.html
  const byCity = {};
  for (const n of neighborhoods) {
    if (!byCity[n.city]) byCity[n.city] = [];
    byCity[n.city].push(n);
  }
  fs.writeFileSync(
    path.join(__dirname, 'neighborhood-city-index.json'),
    JSON.stringify(byCity, null, 2)
  );
  console.log('[generate-neighborhood-pages] City index written: neighborhood-city-index.json');
}

main().catch(e => { console.error(e); process.exit(1); });
