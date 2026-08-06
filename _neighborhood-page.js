/**
 * _neighborhood-page.js — LocalIntel Neighborhood/Region Page Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared engine for all /neighborhood/SLUG pages.
 * Fetches boundary + aggregate stats from Railway, renders:
 *   1. Leaflet map — merged ZIP polygons with individual outlines
 *   2. Stats card  — population, income, businesses, top sectors
 *   3. Intelligence paragraph — deterministic template from census data
 *   4. ZIP cards   — each links to /zip/XXXXX
 *
 * Called by each neighborhood stub via:
 *   <script>const HOOD_SLUG='downtown-jacksonville-jacksonville';</script>
 *   <script src="/_neighborhood-page.js"></script>
 */

(function () {
  'use strict';

  const RAILWAY = 'https://gsb-swarm-production.up.railway.app';
  const slug    = (window.NEIGHBORHOOD_CONFIG && window.NEIGHBORHOOD_CONFIG.slug)
                || window.HOOD_SLUG
                || location.pathname.replace('/neighborhood/', '').replace(/\/$/, '');

  // ── Leaflet CSS + JS lazy-load ───────────────────────────────────────────
  function loadLeaflet(cb) {
    if (window.L) { cb(); return; }
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.onload = cb;
    document.head.appendChild(js);
  }

  // ── Utilities ────────────────────────────────────────────────────────────
  const fmtNum  = n => n >= 1000000 ? (n/1000000).toFixed(1)+'M'
                     : n >= 1000    ? (n/1000).toFixed(1)+'K'
                     : String(n);
  const fmtDollar = n => n ? '$' + Number(n).toLocaleString() : '—';
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  // ── Inject page CSS ─────────────────────────────────────────────────────
  function injectCSS() {
    if (document.getElementById('hood-styles')) return;
    const style = document.createElement('style');
    style.id = 'hood-styles';
    style.textContent = `
      *{box-sizing:border-box;margin:0;padding:0}
      body{background:#0a0a0a;color:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
      a{color:inherit;}
      .hood-loading{padding:80px 20px;text-align:center;color:#6b7280;font-size:15px}
      .hood-error{padding:80px 20px;text-align:center;color:#ef4444;font-size:15px}

      /* Nav */
      .hood-nav{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #1f2937;position:sticky;top:0;background:#0a0a0aee;backdrop-filter:blur(8px);z-index:100}
      .hood-nav-logo{font-weight:700;font-size:16px;color:#00e676;text-decoration:none}
      .hood-nav-cta{background:#00e676;color:#000;padding:7px 16px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none}

      /* Header */
      .hood-header{max-width:900px;margin:0 auto;padding:40px 20px 24px}
      .hood-breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:#6b7280;margin-bottom:14px;flex-wrap:wrap}
      .hood-breadcrumb a{color:#6b7280;text-decoration:none}.hood-breadcrumb a:hover{color:#00e676}
      .bc-sep{color:#374151}.bc-current{color:#d1d5db}
      .hood-title{font-size:clamp(26px,5vw,40px);font-weight:700;color:#f9fafb;margin-bottom:12px}
      .hood-meta-row{display:flex;flex-wrap:wrap;gap:8px}
      .hood-badge{background:#1f2937;border:1px solid #374151;border-radius:20px;padding:4px 12px;font-size:12px;color:#9ca3af}

      /* Map */
      .hood-map-wrap{position:relative;max-width:900px;margin:0 auto 8px;padding:0 20px}
      #hood-map{width:100%;height:400px;border-radius:12px;border:1px solid #1f2937;background:#111;z-index:1}
      .hood-map-legend{position:absolute;bottom:20px;right:32px;z-index:1000;background:rgba(10,10,10,.9);border:1px solid #1f2937;border-radius:8px;padding:8px 12px;font-size:12px;color:#9ca3af}
      .legend-dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;vertical-align:middle}
      .map-zip-label{background:#0a0a0acc;border:1px solid #374151;border-radius:4px;padding:2px 5px;font-size:10px;color:#9ca3af;white-space:nowrap}

      /* Stats */
      .hood-stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;max-width:900px;margin:24px auto;padding:0 20px}
      .stat-card{background:#111;border:1px solid #1f2937;border-radius:10px;padding:16px 14px;text-align:center}
      .stat-val{font-size:22px;font-weight:700;color:#f9fafb;line-height:1.1}
      .stat-unit{font-size:13px;color:#6b7280;font-weight:400}
      .stat-lbl{font-size:11px;color:#6b7280;margin-top:4px;text-transform:uppercase;letter-spacing:.05em}

      /* Sectors */
      .hood-sectors{max-width:900px;margin:0 auto 24px;padding:0 20px}
      .hood-section-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin-bottom:12px}
      .sector-bar-wrap{display:flex;flex-direction:column;gap:8px}
      .sector-row{display:grid;grid-template-columns:100px 1fr 50px;align-items:center;gap:10px}
      .sector-name{font-size:13px;color:#d1d5db;text-transform:capitalize}
      .sector-bar{height:8px;background:#1f2937;border-radius:4px;overflow:hidden}
      .sector-fill{height:100%;background:#00e676;border-radius:4px;transition:width .6s ease}
      .sector-count{font-size:12px;color:#6b7280;text-align:right}

      /* Intel */
      .hood-intel{max-width:900px;margin:0 auto 24px;padding:0 20px}
      .hood-intel-text{font-size:15px;line-height:1.7;color:#d1d5db;background:#111;border:1px solid #1f2937;border-radius:10px;padding:20px;margin-bottom:12px}
      .hood-intel-signals{display:flex;flex-wrap:wrap;gap:8px}
      .signal-chip{background:#1f2937;border:1px solid #374151;border-radius:20px;padding:4px 12px;font-size:12px;color:#9ca3af}

      /* ZIP grid */
      .hood-zips{max-width:900px;margin:0 auto 24px;padding:0 20px}
      .hood-zip-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-top:0}
      .hood-zip-card{display:flex;align-items:center;justify-content:space-between;background:#111;border:1px solid #1f2937;border-radius:10px;padding:14px 16px;text-decoration:none;transition:border-color .15s,background .15s}
      .hood-zip-card:hover{border-color:#00e676;background:#0d1f16}
      .zip-card-code{font-size:15px;font-weight:700;color:#f9fafb}
      .zip-card-name{font-size:12px;color:#6b7280;margin-left:8px;flex:1}
      .zip-card-arrow{font-size:12px;color:#00e676;white-space:nowrap}

      /* CTA */
      .hood-cta{max-width:900px;margin:0 auto 60px;padding:0 20px}
      .hood-cta{background:#111;border:1px solid #1f2937;border-radius:12px;padding:28px 24px;text-align:center}
      .hood-cta-text{font-size:16px;color:#d1d5db;margin-bottom:14px}
      .hood-cta-btn{display:inline-block;background:#00e676;color:#000;padding:10px 24px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none}

      @media(max-width:600px){
        #hood-map{height:260px}
        .hood-stats-grid{grid-template-columns:repeat(2,1fr)}
        .sector-row{grid-template-columns:80px 1fr 40px}
      }
    `;
    document.head.appendChild(style);

    // Inject nav if not present
    if (!document.querySelector('.hood-nav')) {
      const nav = document.createElement('nav');
      nav.className = 'hood-nav';
      nav.innerHTML = `<a href="/" class="hood-nav-logo">LocalIntel</a><a href="/claim" class="hood-nav-cta">Claim Your Listing</a>`;
      document.body.insertBefore(nav, document.body.firstChild);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  async function render() {
    injectCSS();
    // Ensure mount point exists
    let app = document.getElementById('hood-app');
    if (!app) {
      app = document.createElement('div');
      app.id = 'hood-app';
      document.body.appendChild(app);
    }

    app.innerHTML = '<div class="hood-loading">Loading neighborhood data…</div>';

    let data;
    try {
      const res = await fetch(`${RAILWAY}/api/local-intel/neighborhood-boundary?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error(`${res.status}`);
      data = await res.json();
    } catch (e) {
      app.innerHTML = `<div class="hood-error">Could not load neighborhood data. <a href="/">← Back</a></div>`;
      return;
    }

    const { neighborhood: hood, stats, intel_paragraph, zip_boundaries } = data;
    const zips = hood.zip_codes || [];

    // ── Document meta ──────────────────────────────────────────────────────
    document.title = `${hood.name} — ${hood.city} | LocalIntel`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = intel_paragraph.slice(0, 160);

    // ── Schema.org (FAQ + breadcrumbs + dataset) ───────────────────────────
    try {
      const pageUrl = `https://www.thelocalintel.com/neighborhood/${hood.slug || slug}`;
      const schemas = [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'LocalIntel', item: 'https://www.thelocalintel.com/' },
            { '@type': 'ListItem', position: 2, name: 'Neighborhoods', item: 'https://www.thelocalintel.com/#explore' },
            { '@type': 'ListItem', position: 3, name: `${hood.name}, ${hood.city}`, item: pageUrl },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `What local business intelligence does LocalIntel have for ${hood.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: intel_paragraph || `${hood.name} is a neighborhood in ${hood.city}, ${hood.county} County, Florida. LocalIntel provides market signals and routes job requests to verified businesses serving ${hood.name}.`,
              },
            },
            {
              '@type': 'Question',
              name: `How do I find services in ${hood.name}, ${hood.city}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Open ${pageUrl} or search at https://www.thelocalintel.com/search.html. LocalIntel matches requests to verified local businesses in ${hood.name}.`,
              },
            },
            {
              '@type': 'Question',
              name: `How can a business in ${hood.name} get listed?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Claim a free listing at https://www.thelocalintel.com/claim.html to receive priority routing from AI agents and customers searching in ${hood.city}.`,
              },
            },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Dataset',
          name: `${hood.name} Business Intelligence`,
          description: intel_paragraph || `Local business intelligence for ${hood.name}, ${hood.city}, FL.`,
          url: pageUrl,
          provider: { '@type': 'Organization', name: 'LocalIntel', url: 'https://www.thelocalintel.com' },
          spatialCoverage: {
            '@type': 'Place',
            name: `${hood.name}, ${hood.city}, ${hood.county} County, FL`,
          },
        },
      ];
      document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());
      schemas.forEach(schema => {
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.textContent = JSON.stringify(schema);
        document.head.appendChild(s);
      });
    } catch (_) { /* best-effort */ }

    // ── Build page HTML ────────────────────────────────────────────────────
    app.innerHTML = `
      <div class="hood-header">
        <div class="hood-breadcrumb">
          <a href="/">Florida</a>
          <span class="bc-sep">›</span>
          <span>${hood.county} County</span>
          <span class="bc-sep">›</span>
          <span>${hood.city}</span>
          <span class="bc-sep">›</span>
          <span class="bc-current">${hood.name}</span>
        </div>
        <h1 class="hood-title">${hood.name}</h1>
        <div class="hood-meta-row">
          <span class="hood-badge">${hood.region || hood.city}</span>
          <span class="hood-badge">${zips.length} ZIP code${zips.length !== 1 ? 's' : ''}</span>
          ${stats.total_businesses ? `<span class="hood-badge">${fmtNum(stats.total_businesses)} businesses</span>` : ''}
        </div>
      </div>

      <!-- MAP -->
      <div class="hood-map-wrap">
        <div id="hood-map"></div>
        <div class="hood-map-legend">
          <span class="legend-dot" style="background:#00e676"></span> ZIP boundary
        </div>
      </div>

      <!-- STATS CARD -->
      <div class="hood-stats-grid">
        ${stats.total_population ? `<div class="stat-card"><div class="stat-val">${fmtNum(stats.total_population)}</div><div class="stat-lbl">Residents</div></div>` : ''}
        ${stats.avg_median_income ? `<div class="stat-card"><div class="stat-val">${fmtDollar(stats.avg_median_income)}</div><div class="stat-lbl">Median Income</div></div>` : ''}
        ${stats.total_businesses ? `<div class="stat-card"><div class="stat-val">${fmtNum(stats.total_businesses)}</div><div class="stat-lbl">Businesses</div></div>` : ''}
        ${stats.avg_opp_score !== null ? `<div class="stat-card"><div class="stat-val">${stats.avg_opp_score}<span class="stat-unit">/100</span></div><div class="stat-lbl">Opportunity Score</div></div>` : ''}
        ${stats.total_restaurants ? `<div class="stat-card"><div class="stat-val">${fmtNum(stats.total_restaurants)}</div><div class="stat-lbl">Restaurants</div></div>` : ''}
        ${stats.avg_irs_agi ? `<div class="stat-card"><div class="stat-val">${fmtDollar(stats.avg_irs_agi)}</div><div class="stat-lbl">Avg AGI (IRS)</div></div>` : ''}
      </div>

      <!-- TOP SECTORS -->
      ${stats.top_sectors && stats.top_sectors.length ? `
      <div class="hood-sectors">
        <div class="hood-section-label">Top Sectors</div>
        <div class="sector-bar-wrap">
          ${stats.top_sectors.map((s, i) => {
            const pct = Math.round(s.count / stats.total_businesses * 100) || 0;
            return `<div class="sector-row">
              <span class="sector-name">${cap(s.name)}</span>
              <div class="sector-bar"><div class="sector-fill" style="width:${Math.min(pct * 2, 100)}%;opacity:${1 - i * 0.15}"></div></div>
              <span class="sector-count">${fmtNum(s.count)}</span>
            </div>`;
          }).join('')}
        </div>
      </div>` : ''}

      <!-- INTELLIGENCE PARAGRAPH -->
      <div class="hood-intel">
        <div class="hood-section-label">Market Intelligence</div>
        <p class="hood-intel-text">${intel_paragraph}</p>
        <div class="hood-intel-signals">
          ${stats.saturation ? `<span class="signal-chip">${cap(stats.saturation)} market</span>` : ''}
          ${stats.growth_state ? `<span class="signal-chip">${cap(stats.growth_state)} growth</span>` : ''}
          ${stats.consumer_profile ? `<span class="signal-chip">${cap(stats.consumer_profile)} consumers</span>` : ''}
        </div>
      </div>

      <!-- ZIP CARDS -->
      <div class="hood-zips">
        <div class="hood-section-label">ZIP Codes in ${hood.name}</div>
        <div class="hood-zip-grid" id="hood-zip-grid">
          ${zips.map(z => `
            <a href="/zip/${z}" class="zip-card hood-zip-card" data-zip="${z}">
              <span class="zip-card-code">${z}</span>
              <span class="zip-card-name" id="zipname-${z}">${z}</span>
              <span class="zip-card-arrow">View market →</span>
            </a>`).join('')}
        </div>
      </div>

      <!-- CLAIM CTA -->
      <div class="hood-cta">
        <div class="hood-cta-text">Is your business in ${hood.name}?</div>
        <a href="/claim" class="hood-cta-btn">Claim Your Listing →</a>
      </div>
    `;

    // Enrich ZIP card names from zip_boundaries data
    for (const zb of zip_boundaries) {
      const el = document.getElementById(`zipname-${zb.zip}`);
      if (el && zb.city_name) el.textContent = zb.city_name;
    }

    // ── Render Leaflet map ─────────────────────────────────────────────────
    loadLeaflet(() => initMap(zip_boundaries, hood));
  }

  function initMap(zipBoundaries, hood) {
    if (!zipBoundaries.length) return;

    // Compute bounds from all polygons
    let allLats = [], allLons = [];
    for (const zb of zipBoundaries) {
      if (!zb.boundary_geojson) continue;
      const coords = zb.boundary_geojson.type === 'Polygon'
        ? zb.boundary_geojson.coordinates[0]
        : zb.boundary_geojson.coordinates.flat(2);
      for (const [lon, lat] of coords) {
        allLats.push(lat); allLons.push(lon);
      }
    }

    const map = L.map('hood-map', { zoomControl: true, scrollWheelZoom: false });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Draw each ZIP polygon
    const layers = [];
    for (const zb of zipBoundaries) {
      if (!zb.boundary_geojson) continue;
      const layer = L.geoJSON(zb.boundary_geojson, {
        style: {
          color:       '#00e676',
          weight:      2,
          opacity:     0.9,
          fillColor:   '#00e676',
          fillOpacity: 0.08,
        },
      }).addTo(map);

      layer.on('mouseover', function(e) {
        e.target.setStyle({ fillOpacity: 0.22, weight: 3 });
      });
      layer.on('mouseout', function(e) {
        e.target.setStyle({ fillOpacity: 0.08, weight: 2 });
      });
      layer.on('click', function() {
        window.location.href = `/zip/${zb.zip}`;
      });

      // ZIP label
      if (zb.lat && zb.lon) {
        L.marker([zb.lat, zb.lon], {
          icon: L.divIcon({
            className: '',
            html: `<div class="map-zip-label">${zb.zip}</div>`,
            iconSize: [48, 20],
            iconAnchor: [24, 10],
          }),
        }).addTo(map);
      }

      layers.push(layer);
    }

    // Fit map to all polygons
    if (allLats.length) {
      map.fitBounds([
        [Math.min(...allLats), Math.min(...allLons)],
        [Math.max(...allLats), Math.max(...allLons)],
      ], { padding: [24, 24] });
    }
  }

  // ── Boot ─────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
