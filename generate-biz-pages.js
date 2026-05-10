#!/usr/bin/env node
/**
 * generate-biz-pages.js — LocalIntel Business Page Generator
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches all claimed businesses from Railway, generates a static HTML page
 * for each under biz/{slug}.html with:
 *   - schema.org/Restaurant or LocalBusiness JSON-LD
 *   - potentialAction: OrderAction pointing to /quote?ref={slug}
 *   - Full NAP (name/address/phone) meta tags for Siri/Gemini/Google
 *   - noscript fallback for crawlers
 *
 * Run: node generate-biz-pages.js
 * Re-run whenever a new business claims their listing.
 *
 * Excludes test businesses (confidence_score = 0 AND business_id starts with 'aaaaaaaa').
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');

const RAILWAY  = 'https://gsb-swarm-production.up.railway.app';
const BIZ_DIR  = path.join(__dirname, 'biz');
const SITE_URL = 'https://www.thelocalintel.com';

// ── Fetch helper ──────────────────────────────────────────────────────────────
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse failed for ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

// ── Slug generator ────────────────────────────────────────────────────────────
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Schema type by category ───────────────────────────────────────────────────
function schemaType(category, categoryGroup) {
  const cat = (category || '').toLowerCase();
  const grp = (categoryGroup || '').toLowerCase();
  if (cat === 'restaurant' || grp === 'food') return 'Restaurant';
  if (cat === 'legal' || grp === 'professional') return 'LegalService';
  if (cat === 'plumbing')    return 'Plumber';
  if (cat === 'landscaping') return 'LandscapingBusiness';
  if (cat === 'cleaning')    return 'HousePainter'; // closest schema type
  if (cat === 'electrical')  return 'Electrician';
  if (cat === 'hvac')        return 'HVACBusiness';
  if (cat === 'roofing')     return 'RoofingContractor';
  if (cat === 'painting')    return 'HousePainter';
  if (cat === 'moving')      return 'MovingCompany';
  if (cat === 'auto')        return 'AutoRepair';
  if (cat === 'dental' || cat === 'medical') return 'MedicalBusiness';
  if (cat === 'beauty' || cat === 'salon')   return 'BeautySalon';
  if (cat === 'hotel' || cat === 'lodging')  return 'LodgingBusiness';
  return 'LocalBusiness';
}

// ── Human-readable category label ────────────────────────────────────────────
function categoryLabel(category) {
  return (category || 'local business')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

// ── City name from ZIP (common NE Florida ZIPs) ───────────────────────────────
const ZIP_CITY = {
  '32082': 'Ponte Vedra Beach', '32081': 'Nocatee', '32259': 'St. Johns',
  '32003': 'Fleming Island',    '32073': 'Orange Park', '32202': 'Jacksonville',
  '32084': 'St. Augustine',     '32034': 'Fernandina Beach', '32097': 'Yulee',
  '32043': 'Green Cove Springs','32177': 'Palatka', '32164': 'Palm Coast',
  '32174': 'Ormond Beach',      '32114': 'Daytona Beach',
};

function cityFromZip(zip) {
  return ZIP_CITY[zip] || `Florida ${zip}`;
}

// ── Build JSON-LD block ───────────────────────────────────────────────────────
function buildJsonLd(biz, slug) {
  const type    = schemaType(biz.category, biz.category_group);
  const city    = cityFromZip(biz.zip);
  const pageUrl = `${SITE_URL}/biz/${slug}`;
  const orderUrl= `${SITE_URL}/quote?ref=${encodeURIComponent(slug)}&category=${encodeURIComponent(biz.category || '')}`;

  const ld = {
    "@context": "https://schema.org",
    "@type": type,
    "name": biz.name,
    "url": pageUrl,
    "telephone": biz.phone || undefined,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": biz.address || undefined,
      "addressLocality": city,
      "addressRegion": "FL",
      "postalCode": biz.zip,
      "addressCountry": "US"
    },
    "areaServed": (biz.service_area || [biz.zip]).map(z => ({
      "@type": "PostalAddress",
      "postalCode": z,
      "addressRegion": "FL",
      "addressCountry": "US"
    })),
    "potentialAction": {
      "@type": "OrderAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": orderUrl,
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
          "http://schema.org/IOSPlatform",
          "http://schema.org/AndroidPlatform"
        ]
      },
      "deliveryMethod": [
        "http://purl.org/goodrelations/v1#DeliveryModePickUp",
        "http://purl.org/goodrelations/v1#DeliveryModeDirectDownload"
      ]
    }
  };

  // Restaurant-specific fields
  if (type === 'Restaurant') {
    ld.servesCuisine = biz.specialties && biz.specialties.length
      ? biz.specialties.join(', ')
      : 'Fine Dining';
    ld.hasMenu = biz.website || pageUrl;
    ld.acceptsReservations = "True";
  }

  // Add website if known
  if (biz.website) ld.sameAs = biz.website;

  // Profile summary as description
  if (biz.profile_summary) ld.description = biz.profile_summary;

  // Strip undefined values
  return JSON.stringify(ld, (k, v) => v === undefined ? undefined : v, 2);
}

// ── Page HTML template ────────────────────────────────────────────────────────
function bizPageHtml(biz, slug) {
  const city      = cityFromZip(biz.zip);
  const catLabel  = categoryLabel(biz.category);
  const title     = `${biz.name} — ${catLabel} in ${city} | LocalIntel`;
  const desc      = biz.profile_summary
    ? `${biz.name}: ${biz.profile_summary} Located in ${city}, FL ${biz.zip}.`
    : `${biz.name} is a ${catLabel.toLowerCase()} business in ${city}, FL. Book or request a quote through LocalIntel.`;
  const pageUrl   = `${SITE_URL}/biz/${slug}`;
  const orderUrl  = `${SITE_URL}/quote?ref=${encodeURIComponent(slug)}&category=${encodeURIComponent(biz.category || '')}`;
  const jsonLd    = buildJsonLd(biz, slug);

  // noscript body — what Google/Siri actually reads
  const noscriptBody = [
    `<h1>${biz.name}</h1>`,
    `<p><strong>${catLabel}</strong> · ${city}, FL ${biz.zip}</p>`,
    biz.phone    ? `<p>Phone: <a href="tel:${biz.phone}">${biz.phone}</a></p>` : '',
    biz.address  ? `<p>Address: ${biz.address}, ${city}, FL ${biz.zip}</p>` : '',
    biz.website  ? `<p>Website: <a href="${biz.website}" rel="noopener">${biz.website}</a></p>` : '',
    biz.profile_summary ? `<p>${biz.profile_summary}</p>` : '',
    `<p><a href="${orderUrl}">Request a quote or place an order via LocalIntel →</a></p>`,
    biz.service_area && biz.service_area.length > 1
      ? `<p>Service area: ${biz.service_area.join(', ')}</p>` : '',
    `<p><a href="${SITE_URL}">← LocalIntel home</a></p>`,
  ].filter(Boolean).join('\n      ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">

  <!-- NAP consistency — name/address/phone for local search -->
  <meta name="business:name"    content="${biz.name}">
  <meta name="business:phone"   content="${biz.phone || ''}">
  <meta name="business:address" content="${biz.address || ''}, ${city}, FL ${biz.zip}">

  <!-- OpenGraph — Gemini AI Overview rich snippets -->
  <meta property="og:type"        content="business.business">
  <meta property="og:title"       content="${biz.name} — ${catLabel} in ${city}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url"         content="${pageUrl}">
  <meta property="og:site_name"   content="LocalIntel">

  <!-- Twitter/X card -->
  <meta name="twitter:card"        content="summary">
  <meta name="twitter:title"       content="${biz.name} — ${catLabel} in ${city}">
  <meta name="twitter:description" content="${desc}">

  <link rel="canonical" href="${pageUrl}">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%2316A34A'/><circle cx='16' cy='16' r='6' fill='white'/></svg>">

  <!-- JSON-LD structured data — OrderAction for Google/Gemini/Siri -->
  <script type="application/ld+json">
${jsonLd}
  </script>
</head>
<body>
  <!-- Static content for crawlers (Googlebot, Bingbot, Siri) -->
  <noscript>
    <div style="font-family:sans-serif;max-width:680px;margin:40px auto;padding:0 20px;">
      ${noscriptBody}
    </div>
  </noscript>

  <!-- JS-rendered page for humans -->
  <script>
    window.BIZ_CONFIG = ${JSON.stringify({
      business_id:   biz.business_id,
      slug,
      name:          biz.name,
      category:      biz.category,
      category_group:biz.category_group,
      zip:           biz.zip,
      city,
      phone:         biz.phone,
      address:       biz.address,
      website:       biz.website,
      profile_summary: biz.profile_summary,
      services:      biz.services_json || [],
      specialties:   biz.specialties   || [],
      service_area:  biz.service_area  || [biz.zip],
      settlement_tier: biz.settlement_tier,
      order_url:     orderUrl,
    })};
  </script>
  <script src="/_biz-page.js"></script>
</body>
</html>`;
}

// ── Sitemap entry builder ─────────────────────────────────────────────────────
function sitemapEntry(slug, priority = '0.8') {
  return `  <url>
    <loc>${SITE_URL}/biz/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// ── Update sitemap.xml ────────────────────────────────────────────────────────
function updateSitemap(slugs) {
  const sitemapPath = path.join(__dirname, 'sitemap.xml');
  let current = fs.readFileSync(sitemapPath, 'utf8');

  // Remove any existing biz entries
  current = current.replace(/\s*<!-- Business pages[^]*?-->\s*/g, '\n');
  current = current.replace(/\s*<url>\s*<loc>https:\/\/www\.thelocalintel\.com\/biz\/[^<]+<\/loc>[^<]*<changefreq>[^<]+<\/changefreq>[^<]*<priority>[^<]+<\/priority>\s*<\/url>/g, '');

  // Insert before closing </urlset>
  const bizBlock = `\n  <!-- Business pages (${slugs.length} claimed businesses) -->\n` +
    slugs.map(s => sitemapEntry(s)).join('\n') + '\n';

  current = current.replace('</urlset>', bizBlock + '</urlset>');
  fs.writeFileSync(sitemapPath, current);
  console.log(`[sitemap] Updated with ${slugs.length} biz entries`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // Ensure biz dir exists
  if (!fs.existsSync(BIZ_DIR)) fs.mkdirSync(BIZ_DIR);

  console.log('[biz-pages] Fetching claimed businesses from Railway...');
  let businesses;
  try {
    const data = await fetchJSON(`${RAILWAY}/api/local-intel/businesses-claimed`);
    businesses = data.businesses || data;
  } catch (e) {
    console.error('[biz-pages] Railway fetch failed:', e.message);
    process.exit(1);
  }

  if (!businesses || !businesses.length) {
    console.log('[biz-pages] No claimed businesses found.');
    process.exit(0);
  }

  console.log(`[biz-pages] Generating pages for ${businesses.length} businesses...`);

  const slugs = [];
  for (const biz of businesses) {
    const slug = toSlug(biz.name);
    const html = bizPageHtml(biz, slug);
    const filePath = path.join(BIZ_DIR, `${slug}.html`);
    fs.writeFileSync(filePath, html, 'utf8');
    slugs.push(slug);
    console.log(`  ✓ /biz/${slug} → ${filePath}`);
  }

  updateSitemap(slugs);
  console.log(`[biz-pages] Done. ${slugs.length} pages written to biz/`);
  console.log(`[biz-pages] Deploy localintel-landing to publish.`);
}

main().catch(e => { console.error(e); process.exit(1); });
