#!/usr/bin/env node
/**
 * scaffold-zip.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a ZIP landing page from _template.html.
 *
 * Usage:
 *   node scripts/scaffold-zip.js <config.json>
 *   node scripts/scaffold-zip.js --zip 32256  # auto-fills from Postgres
 *
 * Config JSON shape:
 * {
 *   "zip":               "32256",
 *   "city_name":         "Southside Jacksonville",
 *   "region":            "Northeast Florida",
 *   "city_blurb":        "Live business intelligence for ...",
 *   "biz_count":         "794",
 *   "population":        "51,638",
 *   "pop_fallback":      51638,
 *   "hhi_short":         "$70k",
 *   "hhi_full":          "$70,000",
 *   "hhi_fallback":      70000,
 *   "market_profile":    "Established",
 *   "consumer_profile":  "Middle Class Established",
 *   "market_maturity":   "established",
 *   "search_placeholder":"dentist, contractor, restaurant, gym…",
 *   "quick_chips": [
 *     {"label":"Restaurants","query":"restaurants"},
 *     {"label":"Healthcare","query":"healthcare"},
 *     {"label":"Contractors","query":"contractors"},
 *     {"label":"Retail","query":"retail"},
 *     {"label":"Fitness","query":"fitness"}
 *   ],
 *   "nearby_zips": [
 *     {"zip":"32082","city":"Ponte Vedra Beach"},
 *     {"zip":"32081","city":"Nocatee"},
 *     {"zip":"32084","city":"St. Augustine"}
 *   ]
 * }
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '..', 'zip', '_template.html');
const OUT_DIR       = path.join(__dirname, '..', 'zip');

function buildPage(cfg) {
  let html = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  // Build quick chip HTML
  const chips = (cfg.quick_chips || [])
    .map(c => `<button class="chip" onclick="quickSearch('${c.query}')">${c.label}</button>`)
    .join('\n      ');

  // Build nearby ZIP links HTML
  const nearbyLinks = (cfg.nearby_zips || [])
    .map(z => `<a href="/zip/${z.zip}" class="zl">${z.zip} — ${z.city}</a>`)
    .join('\n    ');

  // Token substitution — order matters for tokens that are substrings of others
  const tokens = {
    '{{ZIP}}':               cfg.zip,
    '{{CITY_NAME}}':         cfg.city_name,
    '{{REGION}}':            cfg.region            || 'Northeast Florida',
    '{{CITY_BLURB}}':        cfg.city_blurb,
    '{{BIZ_COUNT}}':         cfg.biz_count,
    '{{POPULATION}}':        cfg.population,
    '{{POP_FALLBACK}}':      String(cfg.pop_fallback),
    '{{HHI_SHORT}}':         cfg.hhi_short,
    '{{HHI_FULL}}':          cfg.hhi_full,
    '{{HHI_FALLBACK}}':      String(cfg.hhi_fallback),
    '{{MARKET_PROFILE}}':    cfg.market_profile,
    '{{CONSUMER_PROFILE}}':  cfg.consumer_profile,
    '{{SEARCH_PLACEHOLDER}}':cfg.search_placeholder || 'dentist, contractor, restaurant, gym…',
    '{{QUICK_CHIPS}}':       chips,
    '{{NEARBY_ZIP_LINKS}}':  nearbyLinks,
    '{{MAP_LAT}}':           String(cfg.map_lat  || 30.19),
    '{{MAP_LON}}':           String(cfg.map_lon  || -81.38),
    '{{MAP_ZOOM}}':          String(cfg.map_zoom || 13),
  };

  for (const [token, value] of Object.entries(tokens)) {
    html = html.split(token).join(value);   // replaceAll without regex
  }

  // Warn if any unreplaced tokens remain
  const remaining = html.match(/\{\{[A-Z_]+\}\}/g);
  if (remaining) {
    console.warn(`⚠  Unreplaced tokens in ${cfg.zip}:`, [...new Set(remaining)].join(', '));
  }

  return html;
}

function scaffold(cfg) {
  const html    = buildPage(cfg);
  const outPath = path.join(OUT_DIR, `${cfg.zip}.html`);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`✓  Written: zip/${cfg.zip}.html (${html.split('\n').length} lines)`);
  return outPath;
}

// ── Known ZIP configs ─────────────────────────────────────────────────────────
// Add new ZIPs here. These are the source of truth for all ZIP pages.
// Run this script to regenerate all pages from the template.
const ZIP_CONFIGS = {
  '32082': {
    zip: '32082',
    city_name: 'Ponte Vedra Beach',
    region: 'Northeast Florida',
    city_blurb: "Live business intelligence for one of Northeast Florida's most affluent coastal communities. Market gaps, sector signals, and commercial data updated continuously.",
    biz_count: '675',
    population: '28,697',
    pop_fallback: 28697,
    hhi_short: '$121k',
    hhi_full: '$121,484',
    hhi_fallback: 121484,
    market_profile: 'Affluent',
    consumer_profile: 'Affluent Established',
    market_maturity: 'mature',
    map_lat:  30.195,
    map_lon:  -81.385,
    map_zoom: 13,
    search_placeholder: 'dentist, contractor, wine bar, gym…',
    quick_chips: [
      {label:'Restaurants', query:'restaurants'},
      {label:'Healthcare',  query:'healthcare'},
      {label:'Contractors', query:'contractors'},
      {label:'Retail',      query:'retail'},
      {label:'Fitness',     query:'fitness'},
      {label:'Wine & Spirits', query:'wine'},
    ],
    nearby_zips: [
      {zip:'32081', city:'Nocatee'},
      {zip:'32084', city:'St. Augustine'},
      {zip:'32092', city:'World Golf Village'},
      {zip:'32259', city:'St. Johns'},
      {zip:'32256', city:'Southside Jacksonville'},
    ],
  },

  '32081': {
    zip: '32081',
    city_name: 'Nocatee',
    region: 'Northeast Florida',
    city_blurb: "Live business intelligence for Nocatee — one of the fastest-growing master-planned communities in the US. Market gaps, sector signals, and commercial data updated continuously.",
    biz_count: '1,153',
    population: '24,368',
    pop_fallback: 24368,
    hhi_short: '$130k',
    hhi_full: '$129,875',
    hhi_fallback: 129875,
    market_profile: 'Affluent',
    consumer_profile: 'Affluent Growing',
    market_maturity: 'growth',
    map_lat:  30.108,
    map_lon:  -81.387,
    map_zoom: 13,
    search_placeholder: 'plumber, dentist, restaurant, gym…',
    quick_chips: [
      {label:'Restaurants', query:'restaurants'},
      {label:'Healthcare',  query:'healthcare'},
      {label:'Contractors', query:'contractors'},
      {label:'Retail',      query:'retail'},
      {label:'Fitness',     query:'fitness'},
      {label:'Schools',     query:'schools'},
    ],
    nearby_zips: [
      {zip:'32082', city:'Ponte Vedra Beach'},
      {zip:'32092', city:'World Golf Village'},
      {zip:'32259', city:'St. Johns'},
      {zip:'32084', city:'St. Augustine'},
    ],
  },
};

// ── CLI entry point ───────────────────────────────────────────────────────────
if (require.main === module) {
  const arg = process.argv[2];

  if (!arg || arg === '--all') {
    // Regenerate all known ZIPs
    console.log(`Regenerating ${Object.keys(ZIP_CONFIGS).length} ZIP pages from template…\n`);
    for (const cfg of Object.values(ZIP_CONFIGS)) scaffold(cfg);
    console.log('\nDone. Review changes with: git diff zip/');

  } else if (arg === '--list') {
    console.log('Known ZIPs:', Object.keys(ZIP_CONFIGS).join(', '));

  } else if (ZIP_CONFIGS[arg]) {
    // Single ZIP by code
    scaffold(ZIP_CONFIGS[arg]);

  } else if (arg.endsWith('.json')) {
    // Custom config file
    const cfg = JSON.parse(fs.readFileSync(arg, 'utf8'));
    scaffold(cfg);

  } else {
    console.error(`Unknown ZIP or file: ${arg}`);
    console.error('Usage: node scripts/scaffold-zip.js [--all | <zip> | <config.json>]');
    process.exit(1);
  }
}

module.exports = { scaffold, buildPage, ZIP_CONFIGS };
