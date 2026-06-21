#!/usr/bin/env node
/**
 * generate-zip-pages.js — LocalIntel ZIP stub generator
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches all FL ZIPs from Railway (/api/local-intel/zips-all), then fetches
 * per-ZIP SEO data from /api/local-intel/zip-seo-data?zip=XXXXX, and bakes
 * real business counts, top categories, population, income, and neighborhoods
 * into the <noscript> block + <title> + <meta description> of each stub.
 *
 * Each stub: SEO metadata + indexable <noscript> static HTML + window.ZIP_CONFIG.
 * The shared engine _zip-page.js does all live rendering. Edit _zip-page.js to
 * update all pages.
 *
 * SEO data fetch is batched at concurrency=10 to avoid hammering Railway.
 * If the SEO endpoint 404s or errors for a ZIP, falls back to generic content.
 *
 * Run: node generate-zip-pages.js
 * Re-run when: adding new ZIPs, or when SEO data changes upstream.
 *
 * Falls back to local flZipSeed.json if Railway ZIP list endpoint is unreachable.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');

const RAILWAY = 'https://gsb-swarm-production.up.railway.app';
const ZIP_DIR = path.join(__dirname, 'zip');
const SEED_PATH = path.join(__dirname, 'flZipSeed.json');
const SEO_CONCURRENCY = 10;

// ── Fetch helper ──────────────────────────────────────────────────────────────
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse failed: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

// ── HTML escape ───────────────────────────────────────────────────────────────
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtNum(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '';
  return v.toLocaleString('en-US');
}

// ── Stub template ─────────────────────────────────────────────────────────────
function stubHTML(z, seo) {
  const city   = z.city;
  const zip    = z.zip;
  const county = z.county;
  const url    = `https://www.thelocalintel.com/zip/${zip}`;

  const businessCount = seo && Number.isFinite(Number(seo.business_count)) ? Number(seo.business_count) : null;
  const topCategories = Array.isArray(seo && seo.top_categories) ? seo.top_categories.filter(Boolean) : [];
  const neighborhoods = Array.isArray(seo && seo.neighborhoods) ? seo.neighborhoods.filter(Boolean) : [];
  const population    = seo && Number.isFinite(Number(seo.population)) ? Number(seo.population) : null;
  const medianIncome  = seo && Number.isFinite(Number(seo.median_income)) ? Number(seo.median_income) : null;
  const medianHome    = seo && Number.isFinite(Number(seo.median_home_value)) ? Number(seo.median_home_value) : null;

  const topCatsStr = topCategories.join(', ');

  // Title + description: service-intent first for Google, market data preserved in body
  let title, desc;
  const topCatHuman = topCatsStr
    ? topCatsStr.split(',').slice(0,2).map(s => s.trim().replace(/_/g,' ')).join(' and ')
    : 'local services';
  if (businessCount !== null) {
    title = `Find Local Services in ${city}, FL ${zip} | Restaurants, Plumbers & More — LocalIntel`;
    desc  = `Looking for a restaurant, plumber, doctor, or local service in ${city}, FL? LocalIntel connects you with ${fmtNum(businessCount)} verified businesses in ${zip}` +
            (topCatsStr ? ` — including ${topCatHuman}` : '') +
            `. Tell us what you need and we’ll find who can help.`;
  } else {
    title = `Find Local Services in ${city}, FL ${zip} — LocalIntel`;
    desc  = `Looking for a restaurant, plumber, doctor, landscaper, or any local service in ${city}, FL ${zip}? LocalIntel routes your request to verified local businesses in ${county} County.`;
  }

  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `${city} (${zip}) Business Intelligence`,
    "description": desc,
    "url": url,
    "provider": { "@type": "Organization", "name": "LocalIntel" },
    "spatialCoverage": { "@type": "Place", "name": `${city}, ${county} County, FL ${zip}` }
  });

  // Build <noscript> body: structured static HTML when we have SEO data,
  // else fall back to the prior evergreen paragraph.
  let noscriptBody;
  if (businessCount !== null) {
    const lines = [];
    lines.push(`<h1>${esc(city)} (${esc(zip)}) — Local Business Intelligence</h1>`);
    const intro = topCatsStr
      ? `${esc(city)} is a market in ${esc(county)} County, Florida with ${esc(fmtNum(businessCount))} active businesses across ${esc(topCatsStr)}.`
      : `${esc(city)} is a market in ${esc(county)} County, Florida with ${esc(fmtNum(businessCount))} active businesses.`;
    lines.push(`<p>${intro}</p>`);
    if (population !== null) {
      const demo = [`Population: ${esc(fmtNum(population))}.`];
      if (medianIncome !== null) demo.push(`Median household income: $${esc(fmtNum(medianIncome))}.`);
      if (medianHome !== null)   demo.push(`Median home value: $${esc(fmtNum(medianHome))}.`);
      lines.push(`<p>${demo.join(' ')}</p>`);
    }
    if (neighborhoods.length) {
      lines.push(`<p>Neighborhoods served: ${esc(neighborhoods.join(', '))}.</p>`);
    }
    lines.push(`<p>LocalIntel routes live service requests, RFQ jobs, and agentic task queries to verified businesses in ${esc(city)}. Join the network to connect to the agentic economy.</p>`);
    lines.push(`<p><a href="https://www.thelocalintel.com">← Back to LocalIntel</a></p>`);
    noscriptBody = lines.join('\n      ');
  } else {
    const evergreen = `${city} (${zip}) is a market in ${county} County, Florida. LocalIntel routes live service requests, RFQ jobs, and agentic task queries to verified businesses operating in this ZIP code. Businesses with an active profile and digital wallet receive priority routing — from food and beverage orders to contractor jobs to professional services. Join the LocalIntel network to connect your business to the agentic economy and start receiving routed work from AI agents, voice assistants, and real customers searching in ${city}.`;
    noscriptBody = `<h1>${esc(city)} (${esc(zip)}) — Local Business Intelligence</h1>
      <p>${esc(evergreen)}</p>
      <p><a href="https://www.thelocalintel.com">← Back to LocalIntel</a></p>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta property="og:title" content="Find Local Services in ${esc(city)}, FL ${esc(zip)} — LocalIntel">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="https://www.thelocalintel.com/images/localintel-logo-512.jpg">
  <meta property="og:image:width" content="512">
  <meta property="og:image:height" content="512">
  <meta property="twitter:card" content="summary">
  <meta property="twitter:image" content="https://www.thelocalintel.com/images/localintel-logo-512.jpg">
  <meta property="og:url" content="${url}">
  <link rel="canonical" href="${url}">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%2316A34A'/><circle cx='16' cy='16' r='6' fill='white'/></svg>">
  <script type="application/ld+json">${schema}</script>
</head>
<body>
  <noscript>
    <div style="font-family:sans-serif;max-width:680px;margin:40px auto;padding:0 20px;">
      ${noscriptBody}
    </div>
  </noscript>
  <script>
    window.ZIP_CONFIG = { zip:'${zip}', name:${JSON.stringify(city)}, county:${JSON.stringify(county)}, lat:${z.lat || 27.6648}, lon:${z.lon || -81.5158} };
  </script>
  <script src="/_zip-page.js"></script>
</body>
</html>`;
}

// ── Batch SEO fetch with concurrency limit ────────────────────────────────────
async function fetchSeoForZip(zip) {
  try {
    return await fetchJSON(`${RAILWAY}/api/local-intel/zip-seo-data?zip=${encodeURIComponent(zip)}`);
  } catch (e) {
    return null;
  }
}

async function fetchAllSeo(zips) {
  const seoByZip = {};
  let done = 0;
  for (let i = 0; i < zips.length; i += SEO_CONCURRENCY) {
    const batch = zips.slice(i, i + SEO_CONCURRENCY);
    const results = await Promise.all(batch.map(z => fetchSeoForZip(z.zip)));
    batch.forEach((z, idx) => { seoByZip[z.zip] = results[idx]; });
    done += batch.length;
    if (done % 100 < SEO_CONCURRENCY) {
      console.log(`[generate-zip-pages] Progress: ${done}/${zips.length}...`);
    }
  }
  return seoByZip;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('[generate-zip-pages] Fetching ZIP list from Railway...');

  let zips;
  try {
    const data = await fetchJSON(`${RAILWAY}/api/local-intel/zips-all`);
    zips = data.zips || [];
    console.log(`[generate-zip-pages] Railway returned ${zips.length} ZIPs (source: ${data.source})`);
  } catch (e) {
    console.warn(`[generate-zip-pages] Railway fetch failed (${e.message}), falling back to local seed`);
    try {
      zips = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
      console.log(`[generate-zip-pages] Local seed: ${zips.length} ZIPs`);
    } catch (e2) {
      console.error('[generate-zip-pages] No seed file found. Run from localintel-landing directory.');
      process.exit(1);
    }
  }

  // Filter: must have zip + city + county
  const valid = zips.filter(z => z.zip && z.city && z.county);
  console.log(`[generate-zip-pages] Fetching SEO data for ${valid.length} ZIPs (concurrency=${SEO_CONCURRENCY})...`);

  const seoByZip = await fetchAllSeo(valid);
  const seoHits = Object.values(seoByZip).filter(Boolean).length;
  console.log(`[generate-zip-pages] SEO data fetched: ${seoHits}/${valid.length} ZIPs returned data`);

  console.log(`[generate-zip-pages] Generating stubs for ${valid.length} valid ZIPs...`);

  if (!fs.existsSync(ZIP_DIR)) fs.mkdirSync(ZIP_DIR);

  let written = 0, skipped = 0;
  for (const z of valid) {
    const filePath = path.join(ZIP_DIR, `${z.zip}.html`);
    const html = stubHTML(z, seoByZip[z.zip]);
    fs.writeFileSync(filePath, html, 'utf8');
    written++;
  }

  console.log(`[generate-zip-pages] Done. Written: ${written}, Skipped: ${skipped}`);
  console.log(`[generate-zip-pages] ZIP pages live at: zip/*.html`);

  // Also write a counties summary for index.html Explore Markets
  const byCounty = {};
  for (const z of valid) {
    if (!byCounty[z.county]) byCounty[z.county] = [];
    byCounty[z.county].push(z);
  }
  const summary = Object.entries(byCounty)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([county, zs]) => ({ county, count: zs.length, zips: zs.sort((a,b) => a.zip.localeCompare(b.zip)) }));

  fs.writeFileSync(
    path.join(__dirname, 'zip-county-index.json'),
    JSON.stringify(summary, null, 2),
    'utf8'
  );
  console.log(`[generate-zip-pages] County index written: ${summary.length} counties → zip-county-index.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
