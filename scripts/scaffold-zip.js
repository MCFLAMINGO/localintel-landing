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
 *   "region":            "Florida",
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
    '{{REGION}}':            cfg.region            || 'Florida',
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
    region: 'Florida',
    city_blurb: "Live business intelligence for one of Florida's most affluent coastal communities. Market gaps, sector signals, and commercial data updated continuously.",
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
    region: 'Florida',
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

  // ── Jacksonville Beaches ────────────────────────────────────────────────────

  '32250': {
    zip: '32250',
    city_name: 'Jacksonville Beach',
    region: 'Florida',
    city_blurb: 'Live business intelligence for Jacksonville Beach — a vibrant coastal city with a dense restaurant and retail corridor along Beach Boulevard and 3rd Street. Market gaps, sector signals, and commercial data updated continuously.',
    biz_count: '1,238',
    population: '30,080',
    pop_fallback: 30080,
    hhi_short: '$72k',
    hhi_full: '$72,400',
    hhi_fallback: 72400,
    market_profile: 'Coastal Mixed',
    consumer_profile: 'Coastal Active',
    market_maturity: 'established',
    map_lat:  30.282,
    map_lon:  -81.393,
    map_zoom: 13,
    search_placeholder: 'surf shop, restaurant, bar, contractor…',
    quick_chips: [
      {label:'Restaurants', query:'restaurants'},
      {label:'Bars & Nightlife', query:'bars'},
      {label:'Retail',      query:'retail'},
      {label:'Healthcare',  query:'healthcare'},
      {label:'Contractors', query:'contractors'},
      {label:'Fitness',     query:'fitness'},
    ],
    nearby_zips: [
      {zip:'32266', city:'Neptune Beach'},
      {zip:'32233', city:'Atlantic Beach'},
      {zip:'32082', city:'Ponte Vedra Beach'},
      {zip:'32224', city:'Southside Jacksonville'},
    ],
  },

  '32266': {
    zip: '32266',
    city_name: 'Neptune Beach',
    region: 'Florida',
    city_blurb: 'Live business intelligence for Neptune Beach — a tight-knit coastal community between Atlantic Beach and Jacksonville Beach with a walkable town center. Market gaps, sector signals, and commercial data updated continuously.',
    biz_count: '316',
    population: '7,217',
    pop_fallback: 7217,
    hhi_short: '$82k',
    hhi_full: '$82,000',
    hhi_fallback: 82000,
    market_profile: 'Coastal Boutique',
    consumer_profile: 'Coastal Affluent',
    market_maturity: 'established',
    map_lat:  30.313,
    map_lon:  -81.405,
    map_zoom: 14,
    search_placeholder: 'coffee, restaurant, yoga, contractor…',
    quick_chips: [
      {label:'Restaurants', query:'restaurants'},
      {label:'Coffee & Cafes', query:'coffee'},
      {label:'Fitness',     query:'fitness'},
      {label:'Retail',      query:'retail'},
      {label:'Healthcare',  query:'healthcare'},
      {label:'Contractors', query:'contractors'},
    ],
    nearby_zips: [
      {zip:'32233', city:'Atlantic Beach'},
      {zip:'32250', city:'Jacksonville Beach'},
      {zip:'32082', city:'Ponte Vedra Beach'},
    ],
  },

  '32233': {
    zip: '32233',
    city_name: 'Atlantic Beach',
    region: 'Florida',
    city_blurb: 'Live business intelligence for Atlantic Beach — a quiet beachside city with a growing dining scene and strong community character. Market gaps, sector signals, and commercial data updated continuously.',
    biz_count: '446',
    population: '23,980',
    pop_fallback: 23980,
    hhi_short: '$79k',
    hhi_full: '$79,200',
    hhi_fallback: 79200,
    market_profile: 'Coastal Residential',
    consumer_profile: 'Coastal Active',
    market_maturity: 'established',
    map_lat:  30.340,
    map_lon:  -81.410,
    map_zoom: 13,
    search_placeholder: 'seafood, yoga, contractor, dentist…',
    quick_chips: [
      {label:'Restaurants', query:'restaurants'},
      {label:'Healthcare',  query:'healthcare'},
      {label:'Fitness',     query:'fitness'},
      {label:'Contractors', query:'contractors'},
      {label:'Retail',      query:'retail'},
    ],
    nearby_zips: [
      {zip:'32266', city:'Neptune Beach'},
      {zip:'32250', city:'Jacksonville Beach'},
      {zip:'32225', city:'Arlington'},
    ],
  },

  '32206': {
    zip: '32206',
    city_name: 'Fairfield',
    region: 'Jacksonville',
    city_blurb: 'Live business intelligence for the Fairfield and Springfield corridors in Jacksonville — a neighborhood with strong growth momentum and increasing commercial investment. Market gaps, sector signals, and commercial data updated continuously.',
    biz_count: '395',
    population: '18,283',
    pop_fallback: 18283,
    hhi_short: '$38k',
    hhi_full: '$38,100',
    hhi_fallback: 38100,
    market_profile: 'Urban Emerging',
    consumer_profile: 'Urban Growth',
    market_maturity: 'growth',
    map_lat:  30.340,
    map_lon:  -81.640,
    map_zoom: 13,
    search_placeholder: 'restaurant, contractor, retail, healthcare…',
    quick_chips: [
      {label:'Restaurants', query:'restaurants'},
      {label:'Contractors', query:'contractors'},
      {label:'Retail',      query:'retail'},
      {label:'Healthcare',  query:'healthcare'},
      {label:'Auto Services', query:'auto'},
    ],
    nearby_zips: [
      {zip:'32202', city:'Downtown Jacksonville'},
      {zip:'32207', city:'San Marco'},
      {zip:'32208', city:'North Jacksonville'},
    ],
  },

  // ── St. Johns County ────────────────────────────────────────────────────────

  '32080': {
    zip: '32080',
    city_name: 'St. Augustine Beach',
    region: 'Florida',
    city_blurb: 'Live business intelligence for St. Augustine Beach — a popular coastal destination with strong seasonal tourism and a growing year-round residential base. Market gaps, sector signals, and commercial data updated continuously.',
    biz_count: '623',
    population: '21,889',
    pop_fallback: 21889,
    hhi_short: '$68k',
    hhi_full: '$68,300',
    hhi_fallback: 68300,
    market_profile: 'Coastal Tourism',
    consumer_profile: 'Tourism & Residential',
    market_maturity: 'established',
    map_lat:  29.855,
    map_lon:  -81.267,
    map_zoom: 13,
    search_placeholder: 'seafood, hotel, contractor, boutique…',
    quick_chips: [
      {label:'Restaurants', query:'restaurants'},
      {label:'Hotels & Lodging', query:'hotels'},
      {label:'Retail',      query:'retail'},
      {label:'Healthcare',  query:'healthcare'},
      {label:'Contractors', query:'contractors'},
    ],
    nearby_zips: [
      {zip:'32084', city:'St. Augustine'},
      {zip:'32086', city:'St. Augustine South'},
      {zip:'32082', city:'Ponte Vedra Beach'},
    ],
  },

  '32084': {
    zip: '32084',
    city_name: 'St. Augustine',
    region: 'Florida',
    city_blurb: "Live business intelligence for St. Augustine — the nation's oldest city and one of Florida's top tourist destinations. Dense commercial activity, strong hospitality sector, and a thriving historic district. Market gaps, sector signals, and commercial data updated continuously.",
    biz_count: '1,366',
    population: '34,526',
    pop_fallback: 34526,
    hhi_short: '$55k',
    hhi_full: '$55,100',
    hhi_fallback: 55100,
    market_profile: 'Historic Tourism Hub',
    consumer_profile: 'Tourism & Mixed Income',
    market_maturity: 'established',
    map_lat:  29.893,
    map_lon:  -81.315,
    map_zoom: 13,
    search_placeholder: 'tour, restaurant, hotel, contractor…',
    quick_chips: [
      {label:'Restaurants', query:'restaurants'},
      {label:'Hotels & Lodging', query:'hotels'},
      {label:'Tours & Attractions', query:'tours'},
      {label:'Retail',      query:'retail'},
      {label:'Healthcare',  query:'healthcare'},
      {label:'Contractors', query:'contractors'},
    ],
    nearby_zips: [
      {zip:'32086', city:'St. Augustine South'},
      {zip:'32080', city:'St. Augustine Beach'},
      {zip:'32092', city:'World Golf Village'},
      {zip:'32095', city:'St. Augustine North'},
    ],
  },

  '32086': {
    zip: '32086',
    city_name: 'St. Augustine South',
    region: 'Florida',
    city_blurb: 'Live business intelligence for south St. Augustine — a residential and commercial corridor with steady growth and proximity to St. Augustine proper. Market gaps, sector signals, and commercial data updated continuously.',
    biz_count: '884',
    population: '31,452',
    pop_fallback: 31452,
    hhi_short: '$57k',
    hhi_full: '$57,400',
    hhi_fallback: 57400,
    market_profile: 'Suburban Established',
    consumer_profile: 'Suburban Mixed',
    market_maturity: 'established',
    map_lat:  29.826,
    map_lon:  -81.310,
    map_zoom: 13,
    search_placeholder: 'contractor, dentist, restaurant, retail…',
    quick_chips: [
      {label:'Restaurants', query:'restaurants'},
      {label:'Healthcare',  query:'healthcare'},
      {label:'Contractors', query:'contractors'},
      {label:'Retail',      query:'retail'},
      {label:'Auto Services', query:'auto'},
    ],
    nearby_zips: [
      {zip:'32084', city:'St. Augustine'},
      {zip:'32080', city:'St. Augustine Beach'},
      {zip:'32092', city:'World Golf Village'},
    ],
  },

  '32092': {
    zip: '32092',
    city_name: 'World Golf Village',
    region: 'Florida',
    city_blurb: 'Live business intelligence for World Golf Village and the fast-growing western St. Johns County corridor — one of the most active growth markets in Florida. Market gaps, sector signals, and commercial data updated continuously.',
    biz_count: '701',
    population: '43,691',
    pop_fallback: 43691,
    hhi_short: '$96k',
    hhi_full: '$96,200',
    hhi_fallback: 96200,
    market_profile: 'Affluent Suburban',
    consumer_profile: 'Affluent Growing',
    market_maturity: 'growth',
    map_lat:  29.988,
    map_lon:  -81.474,
    map_zoom: 12,
    search_placeholder: 'golf, restaurant, contractor, healthcare…',
    quick_chips: [
      {label:'Restaurants', query:'restaurants'},
      {label:'Healthcare',  query:'healthcare'},
      {label:'Contractors', query:'contractors'},
      {label:'Golf & Recreation', query:'golf'},
      {label:'Fitness',     query:'fitness'},
      {label:'Schools',     query:'schools'},
    ],
    nearby_zips: [
      {zip:'32081', city:'Nocatee'},
      {zip:'32082', city:'Ponte Vedra Beach'},
      {zip:'32084', city:'St. Augustine'},
      {zip:'32259', city:'St. Johns'},
    ],
  },

  '32095': {
    zip: '32095',
    city_name: 'St. Augustine North',
    region: 'Florida',
    city_blurb: 'Live business intelligence for northern St. Johns County — a rapidly developing corridor along US-1 and I-95 with new residential and commercial activity. Market gaps, sector signals, and commercial data updated continuously.',
    biz_count: '319',
    population: '16,607',
    pop_fallback: 16607,
    hhi_short: '$88k',
    hhi_full: '$88,000',
    hhi_fallback: 88000,
    market_profile: 'Suburban Growth',
    consumer_profile: 'Affluent Growing',
    market_maturity: 'growth',
    map_lat:  30.015,
    map_lon:  -81.420,
    map_zoom: 12,
    search_placeholder: 'contractor, restaurant, healthcare, retail…',
    quick_chips: [
      {label:'Restaurants', query:'restaurants'},
      {label:'Contractors', query:'contractors'},
      {label:'Healthcare',  query:'healthcare'},
      {label:'Retail',      query:'retail'},
      {label:'Schools',     query:'schools'},
    ],
    nearby_zips: [
      {zip:'32084', city:'St. Augustine'},
      {zip:'32082', city:'Ponte Vedra Beach'},
      {zip:'32092', city:'World Golf Village'},
    ],
  },

  '32259': {
    zip: '32259',
    city_name: 'St. Johns',
    region: 'Florida',
    city_blurb: 'Live business intelligence for St. Johns and Fruit Cove — the largest ZIP by population in St. Johns County and one of the fastest-growing suburban markets in Florida. Market gaps, sector signals, and commercial data updated continuously.',
    biz_count: '713',
    population: '62,169',
    pop_fallback: 62169,
    hhi_short: '$110k',
    hhi_full: '$110,400',
    hhi_fallback: 110400,
    market_profile: 'Affluent Suburban',
    consumer_profile: 'Affluent Family',
    market_maturity: 'growth',
    map_lat:  30.099,
    map_lon:  -81.538,
    map_zoom: 12,
    search_placeholder: 'dentist, contractor, restaurant, gym…',
    quick_chips: [
      {label:'Restaurants', query:'restaurants'},
      {label:'Healthcare',  query:'healthcare'},
      {label:'Contractors', query:'contractors'},
      {label:'Fitness',     query:'fitness'},
      {label:'Schools',     query:'schools'},
      {label:'Retail',      query:'retail'},
    ],
    nearby_zips: [
      {zip:'32081', city:'Nocatee'},
      {zip:'32082', city:'Ponte Vedra Beach'},
      {zip:'32092', city:'World Golf Village'},
      {zip:'32258', city:'Bartram Park'},
    ],
  },

  '32258': {
    zip: '32258',
    city_name: 'Bartram Park',
    region: 'Florida',
    city_blurb: 'Live business intelligence for Bartram Park and southeast Jacksonville — a high-growth corridor connecting St. Johns County with the broader Jacksonville metro. Market gaps, sector signals, and commercial data updated continuously.',
    biz_count: '410',
    population: '37,859',
    pop_fallback: 37859,
    hhi_short: '$88k',
    hhi_full: '$88,500',
    hhi_fallback: 88500,
    market_profile: 'Suburban Growth',
    consumer_profile: 'Affluent Growing',
    market_maturity: 'growth',
    map_lat:  30.123,
    map_lon:  -81.558,
    map_zoom: 12,
    search_placeholder: 'contractor, restaurant, healthcare, gym…',
    quick_chips: [
      {label:'Restaurants', query:'restaurants'},
      {label:'Healthcare',  query:'healthcare'},
      {label:'Contractors', query:'contractors'},
      {label:'Fitness',     query:'fitness'},
      {label:'Retail',      query:'retail'},
    ],
    nearby_zips: [
      {zip:'32259', city:'St. Johns'},
      {zip:'32081', city:'Nocatee'},
      {zip:'32257', city:'Mandarin South'},
      {zip:'32223', city:'Mandarin'},
    ],
  },

  '32223': {
    zip: '32223',
    city_name: 'Mandarin',
    region: 'Jacksonville',
    city_blurb: "Live business intelligence for Mandarin — one of Jacksonville's most established and affluent suburban communities, with a strong local business corridor along San Jose Boulevard. Market gaps, sector signals, and commercial data updated continuously.",
    biz_count: '531',
    population: '25,600',
    pop_fallback: 25600,
    hhi_short: '$84k',
    hhi_full: '$84,300',
    hhi_fallback: 84300,
    market_profile: 'Affluent Suburban',
    consumer_profile: 'Affluent Established',
    market_maturity: 'mature',
    map_lat:  30.165,
    map_lon:  -81.597,
    map_zoom: 13,
    search_placeholder: 'restaurant, dentist, contractor, wine bar…',
    quick_chips: [
      {label:'Restaurants', query:'restaurants'},
      {label:'Healthcare',  query:'healthcare'},
      {label:'Contractors', query:'contractors'},
      {label:'Retail',      query:'retail'},
      {label:'Fitness',     query:'fitness'},
      {label:'Wine & Spirits', query:'wine'},
    ],
    nearby_zips: [
      {zip:'32259', city:'St. Johns'},
      {zip:'32258', city:'Bartram Park'},
      {zip:'32082', city:'Ponte Vedra Beach'},
      {zip:'32217', city:'San Jose'},
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
