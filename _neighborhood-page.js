/**
 * _neighborhood-page.js — LocalIntel Neighborhood Page Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared engine for all neighborhood pages. Works identically to _zip-page.js.
 * Each neighborhood stub sets window.NEIGHBORHOOD_CONFIG and loads this script.
 *
 * Fetches from: /api/local-intel/neighborhood?slug=
 */

(function () {
  'use strict';

  const C = window.NEIGHBORHOOD_CONFIG || {};
  const RAILWAY = 'https://gsb-swarm-production.up.railway.app';

  // ── Styles ────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0a0a0a; --bg-card: #111; --border: #1e1e1e;
      --text: #e8e8e8; --text-muted: #666; --green: #16a34a; --green-light: #22c55e;
    }
    body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; }
    a { color: var(--green-light); text-decoration: none; }
    a:hover { text-decoration: underline; }

    .nb-nav { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid var(--border); }
    .nb-nav-brand { font-size: 15px; font-weight: 800; color: var(--text); letter-spacing: -.02em; }
    .nb-nav-links { display: flex; gap: 20px; font-size: 13px; }
    .nb-breadcrumb { font-size: 12px; color: var(--text-muted); padding: 12px 24px; border-bottom: 1px solid var(--border); }
    .nb-breadcrumb a { color: var(--text-muted); }
    .nb-breadcrumb span { color: var(--text-muted); margin: 0 6px; }

    .nb-hero { padding: 40px 24px 32px; border-bottom: 1px solid var(--border); max-width: 960px; margin: 0 auto; }
    .nb-hero-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--green); margin-bottom: 8px; }
    .nb-hero-title { font-size: 32px; font-weight: 800; letter-spacing: -.03em; margin-bottom: 6px; }
    .nb-hero-sub { font-size: 14px; color: var(--text-muted); margin-bottom: 20px; }
    .nb-hero-meta { display: flex; gap: 16px; flex-wrap: wrap; }
    .nb-meta-pill { font-size: 11px; font-weight: 600; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 4px 12px; color: var(--text-muted); }
    .nb-meta-pill strong { color: var(--text); }

    .nb-kpi-bar { display: flex; gap: 0; border-bottom: 1px solid var(--border); overflow-x: auto; }
    .nb-kpi { flex: 1; min-width: 120px; padding: 20px 24px; border-right: 1px solid var(--border); }
    .nb-kpi:last-child { border-right: none; }
    .nb-kpi-val { font-size: 22px; font-weight: 800; letter-spacing: -.03em; color: var(--text); }
    .nb-kpi-label { font-size: 11px; color: var(--text-muted); margin-top: 2px; text-transform: uppercase; letter-spacing: .06em; }

    .nb-main { max-width: 960px; margin: 0 auto; padding: 32px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 700px) { .nb-main { grid-template-columns: 1fr; } }

    .nb-panel { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
    .nb-panel-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--text-muted); margin-bottom: 16px; }
    .nb-biz-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
    .nb-biz-row:last-child { border-bottom: none; }
    .nb-biz-name { font-weight: 600; }
    .nb-biz-cat { font-size: 11px; color: var(--text-muted); }
    .nb-biz-claimed { font-size: 10px; font-weight: 700; color: var(--green); background: rgba(22,163,74,.1); border-radius: 20px; padding: 2px 8px; }

    .nb-sector-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; font-size: 13px; }
    .nb-sector-bar { height: 4px; background: var(--green); border-radius: 2px; min-width: 4px; }
    .nb-sector-name { flex: 1; }
    .nb-sector-count { color: var(--text-muted); font-size: 12px; }

    .nb-zip-links { display: flex; flex-wrap: wrap; gap: 8px; }
    .nb-zip-link { font-size: 12px; font-weight: 600; color: var(--green-light); background: rgba(34,197,94,.07); border: 1px solid rgba(34,197,94,.2); border-radius: 8px; padding: 4px 12px; }

    .nb-cta { background: linear-gradient(135deg, rgba(22,163,74,.12), rgba(34,197,94,.06)); border: 1px solid rgba(34,197,94,.2); border-radius: 12px; padding: 24px; text-align: center; margin: 0 24px 32px; max-width: 960px; margin-left: auto; margin-right: auto; }
    .nb-cta h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
    .nb-cta p { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }
    .nb-cta-btn { display: inline-block; background: var(--green); color: white; font-size: 13px; font-weight: 700; padding: 10px 24px; border-radius: 8px; }
    .nb-cta-btn:hover { background: var(--green-light); text-decoration: none; }

    .nb-loading { text-align: center; padding: 80px 24px; color: var(--text-muted); font-size: 14px; }
    .nb-footer { border-top: 1px solid var(--border); padding: 20px 24px; text-align: center; font-size: 12px; color: var(--text-muted); margin-top: 40px; }
  `;
  document.head.appendChild(style);
  document.title = `${C.name}, ${C.city} — Local Business Intelligence | LocalIntel`;

  // ── Shell ─────────────────────────────────────────────────────────────────
  document.body.innerHTML = `
    <nav class="nb-nav">
      <a href="/" class="nb-nav-brand">LocalIntel</a>
      <div class="nb-nav-links">
        <a href="/">Home</a>
        <a href="/search.html">Search</a>
        <a href="/claim.html">Claim Listing</a>
      </div>
    </nav>
    <div class="nb-breadcrumb">
      <a href="/">LocalIntel</a><span>›</span>
      <a href="/#explore">Florida</a><span>›</span>
      <a href="/zip/${(C.zips||[])[0] || ''}">${C.city}</a><span>›</span>
      ${C.name}
    </div>
    <div id="nb-content"><div class="nb-loading">Loading ${C.name} market data...</div></div>
    <div class="nb-footer">© 2026 LocalIntel — Florida Business Intelligence</div>
  `;

  // ── Fetch + Render ────────────────────────────────────────────────────────
  async function load() {
    let data;
    try {
      const r = await fetch(`${RAILWAY}/api/local-intel/neighborhood?slug=${C.slug}`);
      data = await r.json();
    } catch (e) {
      document.getElementById('nb-content').innerHTML =
        `<div class="nb-loading">Unable to load market data. <a href="/">← Back to LocalIntel</a></div>`;
      return;
    }

    if (!data.available || data.error) {
      document.getElementById('nb-content').innerHTML =
        `<div class="nb-loading">Data not yet available for ${C.name}. <a href="/claim.html">Claim your listing →</a></div>`;
      return;
    }

    const hood = data.neighborhood;
    const bizzes = data.businesses || [];
    const sectors = data.sectors || [];
    const maxSector = sectors[0] ? parseInt(sectors[0].count) : 1;

    // KPI bar
    const kpis = [
      { val: hood.business_count || bizzes.length, label: 'Businesses' },
      { val: bizzes.filter(b => b.claimed).length || '—', label: 'Claimed' },
      { val: sectors[0] ? sectors[0].category : '—', label: 'Top Sector' },
      { val: hood.region || '—', label: 'Region' },
    ];

    // Businesses panel (top 8)
    const bizRows = bizzes.slice(0, 8).map(b => `
      <div class="nb-biz-row">
        <div>
          <div class="nb-biz-name">${esc(b.name)}</div>
          <div class="nb-biz-cat">${esc(b.category || '')}</div>
        </div>
        ${b.claimed ? '<span class="nb-biz-claimed">Claimed</span>' : ''}
      </div>
    `).join('') || '<div style="color:var(--text-muted);font-size:13px">No businesses indexed yet.</div>';

    // Sector panel
    const sectorRows = sectors.slice(0, 8).map(s => `
      <div class="nb-sector-row">
        <div class="nb-sector-bar" style="width:${Math.max(4, Math.round(parseInt(s.count)/maxSector*80))}px"></div>
        <span class="nb-sector-name">${esc(s.category)}</span>
        <span class="nb-sector-count">${s.count}</span>
      </div>
    `).join('') || '<div style="color:var(--text-muted);font-size:13px">Sector data loading.</div>';

    // ZIP links
    const zipLinks = (hood.zip_codes || []).map(z =>
      `<a href="/zip/${z}" class="nb-zip-link">${z}</a>`
    ).join('');

    document.getElementById('nb-content').innerHTML = `
      <div class="nb-hero">
        <div class="nb-hero-label">${esc(hood.region || hood.county + ' County')} · ${esc(hood.city)}, FL</div>
        <h1 class="nb-hero-title">${esc(hood.name)}</h1>
        <div class="nb-hero-sub">${esc(hood.description || '')}</div>
        <div class="nb-hero-meta">
          <span class="nb-meta-pill"><strong>${hood.business_count || 0}</strong> businesses tracked</span>
          <span class="nb-meta-pill">ZIP ${(hood.zip_codes||[]).join(', ')}</span>
          <span class="nb-meta-pill">${esc(hood.county)} County</span>
        </div>
      </div>

      <div class="nb-kpi-bar">
        ${kpis.map(k => `
          <div class="nb-kpi">
            <div class="nb-kpi-val">${k.val}</div>
            <div class="nb-kpi-label">${k.label}</div>
          </div>
        `).join('')}
      </div>

      <div class="nb-main">
        <div class="nb-panel">
          <div class="nb-panel-title">Businesses in ${esc(hood.name)}</div>
          ${bizRows}
          ${bizzes.length > 8 ? `<div style="font-size:12px;color:var(--text-muted);margin-top:12px">${bizzes.length - 8} more · <a href="/search.html?neighborhood=${C.slug}">Search all →</a></div>` : ''}
        </div>
        <div class="nb-panel">
          <div class="nb-panel-title">Sector Breakdown</div>
          ${sectorRows}
        </div>
        <div class="nb-panel">
          <div class="nb-panel-title">ZIP Codes in this Neighborhood</div>
          <div class="nb-zip-links">${zipLinks || '—'}</div>
        </div>
        <div class="nb-panel">
          <div class="nb-panel-title">Region</div>
          <div style="font-size:14px;color:var(--text-muted)">${esc(hood.region || '—')} · ${esc(hood.city)}, FL</div>
        </div>
      </div>

      <div class="nb-cta">
        <h3>Is your business in ${esc(hood.name)}?</h3>
        <p>Claim your listing to receive routed job requests from AI agents and local customers.</p>
        <a href="/claim.html" class="nb-cta-btn">Claim Your Free Listing →</a>
      </div>
    `;
  }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  load();
})();
