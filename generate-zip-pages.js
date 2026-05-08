#!/usr/bin/env node
/**
 * generate-zip-pages.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates 41 ZIP stub pages. Each page is ~20 lines — just SEO meta tags
 * + window.ZIP_CONFIG. All rendering lives in /_zip-page.js (shared).
 *
 * Run: node generate-zip-pages.js
 * To update ALL pages: edit _zip-page.js and deploy — no need to re-run this.
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const OUT  = path.join(__dirname, 'zip');

const ALL_ZIPS = [
  { zip:'32081', name:'Nocatee',                  county:'St. Johns', lat:30.1113, lon:-81.3967 },
  { zip:'32082', name:'Ponte Vedra Beach',         county:'St. Johns', lat:30.1960, lon:-81.3845 },
  { zip:'32092', name:'World Golf Village',        county:'St. Johns', lat:29.9902, lon:-81.4768 },
  { zip:'32084', name:'St. Augustine',             county:'St. Johns', lat:29.8947, lon:-81.3145 },
  { zip:'32086', name:'St. Augustine South',       county:'St. Johns', lat:29.8200, lon:-81.3100 },
  { zip:'32095', name:'Palm Valley',               county:'St. Johns', lat:30.1500, lon:-81.4000 },
  { zip:'32080', name:'St. Augustine Beach',       county:'St. Johns', lat:29.8566, lon:-81.2648 },
  { zip:'32259', name:'Fruit Cove',                county:'St. Johns', lat:30.0797, lon:-81.5650 },
  { zip:'32250', name:'Jacksonville Beach',        county:'Duval',     lat:30.2852, lon:-81.3993 },
  { zip:'32266', name:'Neptune Beach',             county:'Duval',     lat:30.3127, lon:-81.4020 },
  { zip:'32258', name:'Bartram Park',              county:'Duval',     lat:30.0750, lon:-81.5500 },
  { zip:'32226', name:'North Jacksonville',        county:'Duval',     lat:30.4500, lon:-81.5200 },
  { zip:'32256', name:'Baymeadows',                county:'Duval',     lat:30.2150, lon:-81.5500 },
  { zip:'32257', name:'Mandarin South',            county:'Duval',     lat:30.1500, lon:-81.6000 },
  { zip:'32224', name:'Jacksonville Intracoastal', county:'Duval',     lat:30.2800, lon:-81.4500 },
  { zip:'32225', name:'Jacksonville Arlington',    county:'Duval',     lat:30.3200, lon:-81.5000 },
  { zip:'32246', name:'Jacksonville Regency',      county:'Duval',     lat:30.2900, lon:-81.5300 },
  { zip:'32233', name:'Atlantic Beach',            county:'Duval',     lat:30.3336, lon:-81.3993 },
  { zip:'32211', name:'Jacksonville East',         county:'Duval',     lat:30.3300, lon:-81.5800 },
  { zip:'32216', name:'Southside Blvd',            county:'Duval',     lat:30.2600, lon:-81.5400 },
  { zip:'32217', name:'San Jose',                  county:'Duval',     lat:30.2100, lon:-81.6200 },
  { zip:'32207', name:'Jacksonville Southbank',    county:'Duval',     lat:30.3000, lon:-81.6500 },
  { zip:'32223', name:'Mandarin',                  county:'Duval',     lat:30.1700, lon:-81.6300 },
  { zip:'32206', name:'Jacksonville North',        county:'Duval',     lat:30.3500, lon:-81.6500 },
  { zip:'32205', name:'Avondale / Riverside',      county:'Duval',     lat:30.3100, lon:-81.6900 },
  { zip:'32210', name:'Wesconnett',                county:'Duval',     lat:30.2800, lon:-81.7100 },
  { zip:'32218', name:'Jacksonville Northwest',    county:'Duval',     lat:30.4000, lon:-81.6500 },
  { zip:'32244', name:'Jacksonville Westside',     county:'Duval',     lat:30.2500, lon:-81.7100 },
  { zip:'32003', name:'Fleming Island',            county:'Clay',      lat:30.1000, lon:-81.7200 },
  { zip:'32065', name:'Orange Park / Oakleaf',     county:'Clay',      lat:30.1700, lon:-81.7800 },
  { zip:'32073', name:'Orange Park',               county:'Clay',      lat:30.1700, lon:-81.7100 },
  { zip:'32043', name:'Green Cove Springs',        county:'Clay',      lat:29.9900, lon:-81.6800 },
  { zip:'32034', name:'Fernandina Beach',          county:'Nassau',    lat:30.6696, lon:-81.4626 },
  { zip:'32097', name:'Yulee',                     county:'Nassau',    lat:30.6335, lon:-81.5979 },
  { zip:'32168', name:'New Smyrna Beach',          county:'Volusia',   lat:29.0258, lon:-80.9270 },
  { zip:'32174', name:'Ormond Beach',              county:'Volusia',   lat:29.2858, lon:-81.0559 },
  { zip:'32117', name:'Daytona Beach North',       county:'Volusia',   lat:29.2274, lon:-81.0228 },
  { zip:'32118', name:'Daytona Beach',             county:'Volusia',   lat:29.2108, lon:-81.0228 },
  { zip:'32136', name:'Flagler Beach',             county:'Flagler',   lat:29.4733, lon:-81.1290 },
  { zip:'32137', name:'Palm Coast',                county:'Flagler',   lat:29.5844, lon:-81.2079 },
  { zip:'32177', name:'Palatka',                   county:'Putnam',    lat:29.6486, lon:-81.6376 },
  { zip:'32608', name:'Gainesville West',          county:'Alachua',   lat:29.6516, lon:-82.4244 },
  { zip:'32601', name:'Gainesville',               county:'Alachua',   lat:29.6516, lon:-82.3248 },
];

function stub(z) {
  const metaDesc = `Live business intelligence for ${z.name}, FL ${z.zip}. Market gaps, sector signals, permits, and income data for ${z.county} County.`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${z.name} (${z.zip}) Business Intelligence — LocalIntel</title>
  <meta name="description" content="${metaDesc}">
  <meta property="og:title" content="${z.name} (${z.zip}) — Local Business Intelligence">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:url" content="https://www.thelocalintel.com/zip/${z.zip}">
  <link rel="canonical" href="https://www.thelocalintel.com/zip/${z.zip}">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%2316A34A'/><circle cx='16' cy='16' r='6' fill='white'/></svg>">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Dataset","name":"${z.name} (${z.zip}) Business Intelligence","description":"${metaDesc}","url":"https://www.thelocalintel.com/zip/${z.zip}","provider":{"@type":"Organization","name":"LocalIntel"},"spatialCoverage":{"@type":"Place","name":"${z.name}, ${z.county} County, FL ${z.zip}"}}</script>
</head>
<body>
  <script>
    window.ZIP_CONFIG = { zip:'${z.zip}', name:'${z.name}', county:'${z.county}', lat:${z.lat}, lon:${z.lon} };
  </script>
  <script src="/_zip-page.js"></script>
</body>
</html>`;
}

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

let count = 0;
for (const z of ALL_ZIPS) {
  fs.writeFileSync(path.join(OUT, `${z.zip}.html`), stub(z), 'utf8');
  console.log(`  ✓ ${z.zip} — ${z.name}`);
  count++;
}
console.log(`\nGenerated ${count} ZIP stubs → zip/`);
console.log('All pages share /_zip-page.js — edit that file to update all 41 at once.');
