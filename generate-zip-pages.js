#!/usr/bin/env node
/**
 * generate-zip-pages.js — LocalIntel ZIP stub generator
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches all FL ZIPs from Railway (/api/local-intel/zips-all), generates a
 * tiny stub HTML file for each one under zip/XXXXX.html.
 *
 * Each stub is ~20 lines: SEO metadata + window.ZIP_CONFIG. The shared engine
 * _zip-page.js does all rendering. Edit _zip-page.js to update all pages.
 *
 * Run: node generate-zip-pages.js
 * Re-run when: adding new ZIPs (data flows in automatically via Railway)
 *
 * Falls back to local flZipSeed.json if Railway is unreachable.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');

const RAILWAY = 'https://gsb-swarm-production.up.railway.app';
const ZIP_DIR = path.join(__dirname, 'zip');
const SEED_PATH = path.join(__dirname, 'flZipSeed.json');

// ── Fetch helper ──────────────────────────────────────────────────────────────
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse failed: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

// ── Stub template ─────────────────────────────────────────────────────────────
function stubHTML(z) {
  const title  = `${z.city} (${z.zip}) Business Intelligence — LocalIntel`;
  const desc   = `Live business intelligence for ${z.city}, FL ${z.zip}. Market gaps, sector signals, permits, and income data for ${z.county} County.`;
  const ogDesc = `Live business intelligence for ${z.city}, FL ${z.zip}. Market gaps, sector signals, permits, and income data for ${z.county} County.`;
  const url    = `https://www.thelocalintel.com/zip/${z.zip}`;
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `${z.city} (${z.zip}) Business Intelligence`,
    "description": desc,
    "url": url,
    "provider": { "@type": "Organization", "name": "LocalIntel" },
    "spatialCoverage": { "@type": "Place", "name": `${z.city}, ${z.county} County, FL ${z.zip}` }
  });

  const evergreen = `${z.city} (${z.zip}) is a market in ${z.county} County, Florida. LocalIntel routes live service requests, RFQ jobs, and agentic task queries to verified businesses operating in this ZIP code. Businesses with an active profile and digital wallet receive priority routing — from food and beverage orders to contractor jobs to professional services. Join the LocalIntel network to connect your business to the agentic economy and start receiving routed work from AI agents, voice assistants, and real customers searching in ${z.city}.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta property="og:title" content="${z.city} (${z.zip}) — Local Business Intelligence">
  <meta property="og:description" content="${ogDesc}">
  <meta property="og:url" content="${url}">
  <link rel="canonical" href="${url}">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%2316A34A'/><circle cx='16' cy='16' r='6' fill='white'/></svg>">
  <script type="application/ld+json">${schema}</script>
</head>
<body>
  <noscript>
    <div style="font-family:sans-serif;max-width:680px;margin:40px auto;padding:0 20px;">
      <h1>${z.city} (${z.zip}) — Local Business Intelligence</h1>
      <p>${evergreen}</p>
      <p><a href="https://www.thelocalintel.com">← Back to LocalIntel</a></p>
    </div>
  </noscript>
  <script>
    window.ZIP_CONFIG = { zip:'${z.zip}', name:${JSON.stringify(z.city)}, county:${JSON.stringify(z.county)}, lat:${z.lat || 27.6648}, lon:${z.lon || -81.5158} };
  </script>
  <script src="/_zip-page.js"></script>
</body>
</html>`;
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
  console.log(`[generate-zip-pages] Generating stubs for ${valid.length} valid ZIPs...`);

  if (!fs.existsSync(ZIP_DIR)) fs.mkdirSync(ZIP_DIR);

  let written = 0, skipped = 0;
  for (const z of valid) {
    const filePath = path.join(ZIP_DIR, `${z.zip}.html`);
    const html = stubHTML(z);
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
