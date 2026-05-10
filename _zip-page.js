/**
 * _zip-page.js — LocalIntel shared ZIP page engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Loaded by every ZIP stub page. Reads window.ZIP_CONFIG, builds the full
 * page DOM, fetches live Railway data, and renders everything.
 *
 * To update ALL 41 ZIP pages: edit this file and deploy localintel-landing.
 * No need to touch individual zip/*.html stubs.
 */

(function () {
  'use strict';

  const C = window.ZIP_CONFIG || {};
  const ZIP    = C.zip    || '00000';
  const NAME   = C.name   || 'Unknown';
  const COUNTY = C.county || 'Unknown';
  const LAT    = C.lat    || 30.19;
  const LON    = C.lon    || -81.38;
  const RAILWAY = 'https://gsb-swarm-production.up.railway.app';

  const COUNTY_DESC = {
    'St. Johns': "one of Florida's fastest-growing and most affluent counties",
    'Duval':     "the Jacksonville metro core — Florida's largest city by area",
    'Clay':      'a growing suburban corridor southwest of Jacksonville',
    'Nassau':    'a coastal county north of Jacksonville with strong growth momentum',
    'Volusia':   'the Daytona Beach metro — tourism, healthcare, and retirement driven',
    'Flagler':   'one of the fastest-growing counties in Florida',
    'Putnam':    'a river-corridor market along the St. Johns River',
    'Alachua':   'a university market anchored by the University of Florida',
  };
  const desc = COUNTY_DESC[COUNTY] || 'Northeast Florida';

  // ── Inject styles ───────────────────────────────────────────────────────────
  const STYLES = `
    :root{--bg:#fff;--bg-2:#f9fafb;--bg-dark:#111827;--text:#111827;--text-2:#6B7280;--text-3:#9CA3AF;--green:#16A34A;--green-h:#15803D;--green-l:#DCFCE7;--green-t:#166534;--border:#E5E7EB;--r:10px;--rl:16px;--font:'Inter',-apple-system,sans-serif;--max:1100px}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
    body{font-family:var(--font);font-size:16px;line-height:1.65;color:var(--text);background:var(--bg)}
    a{color:inherit;text-decoration:none}
    nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.96);backdrop-filter:blur(8px);border-bottom:1px solid var(--border);height:60px;display:flex;align-items:center}
    .ni{max-width:var(--max);margin:0 auto;padding:0 24px;width:100%;display:flex;align-items:center;justify-content:space-between}
    .logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:15px}
    .logo-dot{width:26px;height:26px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center}
    .logo-dot::after{content:'';width:9px;height:9px;border-radius:50%;background:#fff}
    .nav-links{display:flex;align-items:center;gap:6px}
    .nav-links a{padding:7px 14px;border-radius:6px;font-size:14px;color:var(--text-2);font-weight:500;transition:background .15s,color .15s}
    .nav-links a:hover{background:var(--bg-2);color:var(--text)}
    .nav-links .cta{background:var(--green);color:#fff;font-weight:600}
    .nav-links .cta:hover{background:var(--green-h)}
    .hero{background:linear-gradient(135deg,#f0fdf4 0%,#fff 60%);border-bottom:1px solid var(--border);padding:64px 24px 52px}
    .hi{max-width:var(--max);margin:0 auto}
    .bc{font-size:13px;color:var(--text-3);margin-bottom:16px}
    .bc a{color:var(--green)}
    .bc a:hover{text-decoration:underline}
    .zbadge{display:inline-flex;align-items:center;gap:6px;background:var(--green-l);color:var(--green-t);font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:4px 10px;border-radius:20px;margin-bottom:16px}
    h1{font-size:clamp(28px,4vw,44px);font-weight:800;line-height:1.15;letter-spacing:-.02em;margin-bottom:14px}
    .hsub{font-size:17px;color:var(--text-2);max-width:560px;margin-bottom:32px;line-height:1.6}
    .hstats{display:flex;flex-wrap:wrap;gap:24px;margin-bottom:36px}
    .stat{display:flex;flex-direction:column}
    .snum{font-size:28px;font-weight:800;color:var(--green);line-height:1}
    .slbl{font-size:12px;color:var(--text-3);margin-top:3px;font-weight:500;text-transform:uppercase;letter-spacing:.04em}
    .hctas{display:flex;flex-wrap:wrap;gap:10px}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:var(--r);font-size:15px;font-weight:600;cursor:pointer;transition:all .15s;border:none;text-decoration:none}
    .btn-p{background:var(--green);color:#fff}
    .btn-p:hover{background:var(--green-h);transform:translateY(-1px);box-shadow:0 4px 12px rgba(22,163,74,.3)}
    .btn-s{background:#fff;color:var(--text);border:1.5px solid var(--border)}
    .btn-s:hover{border-color:var(--green);color:var(--green)}
    .main{max-width:var(--max);margin:0 auto;padding:52px 24px}
    .sec-title{font-size:20px;font-weight:700;margin-bottom:4px;letter-spacing:-.01em}
    .sec-title span{color:var(--green)}
    .sec-sub{font-size:14px;color:var(--text-2);margin-bottom:20px}
    /* Gap grid */
    .gap-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin-bottom:52px}
    .gc{background:var(--bg-2);border:1px solid var(--border);border-radius:var(--rl);padding:20px}
    .gc.urgent{border-color:#fca5a5;background:#fff5f5}
    .gc.moderate{border-color:#fed7aa;background:#fffbf5}
    .gc.slight{border-color:#fef9c3;background:#fffef5}
    .gc.saturated{border-color:#bbf7d0;background:#f0fdf4}
    .gc-icon{font-size:24px;margin-bottom:8px}
    .gc-sector{font-weight:700;font-size:15px;margin-bottom:4px}
    .gc-label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}
    .gc-label.urgent{color:#dc2626}.gc-label.moderate{color:#d97706}.gc-label.slight{color:#ca8a04}.gc-label.saturated{color:var(--green-t)}
    .gc-sub{font-size:12px;color:var(--text-2);margin-bottom:12px;line-height:1.5}
    .gc-gate{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:10px;border-top:1px solid var(--border)}
    .gc-gate-lbl{font-size:11px;color:var(--text-3)}
    .gc-gate-btn{font-size:12px;font-weight:600;color:var(--green)}
    .gc-gate-btn:hover{text-decoration:underline}
    /* Industry */
    .ind-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:52px}
    .ic{background:var(--bg-2);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px}
    .ic-label{font-size:13px;font-weight:600;margin-bottom:6px}
    .ic-estab{font-size:20px;font-weight:800;color:var(--green)}
    .ic-sub{font-size:11px;color:var(--text-3);margin-top:2px}
    .ic-badge{display:inline-block;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;margin-top:6px;letter-spacing:.04em}
    .ic-badge.dense{background:#dcfce7;color:#166534}
    .ic-badge.bal{background:#e5e7eb;color:#6b7280}
    .ic-badge.under{background:#ffedd5;color:#9a3412}
    /* Permits — premium gate */
    .permit-gate{background:var(--bg-2);border:1px solid var(--border);border-radius:var(--rl);padding:28px;margin-bottom:52px;position:relative;overflow:hidden}
    .permit-gate::before{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(249,250,251,.97) 75%);pointer-events:none;z-index:1}
    .permit-blurred{display:flex;flex-direction:column;gap:14px;filter:blur(3px);user-select:none;pointer-events:none}
    .permit-blur-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)}
    .permit-blur-row:last-child{border-bottom:none}
    .permit-blur-lbl{font-size:14px;color:var(--text-2)}
    .permit-blur-val{font-size:18px;font-weight:800;color:var(--text)}
    .permit-cta{position:absolute;bottom:0;left:0;right:0;z-index:2;display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px 24px 24px;text-align:center}
    .permit-lock-label{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3)}
    .permit-lock-msg{font-size:15px;font-weight:600;color:var(--text);max-width:380px;line-height:1.5}
    .permit-lock-sub{font-size:13px;color:var(--text-2);max-width:340px}
    .permit-consult-btn{display:inline-flex;align-items:center;gap:7px;padding:11px 22px;background:var(--text);color:#fff;border-radius:var(--r);font-size:14px;font-weight:700;cursor:pointer;text-decoration:none;transition:background .15s}
    .permit-consult-btn:hover{background:#1f2937}
    /* Demo */
    .demo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:52px}
    .dc{background:var(--bg-2);border:1px solid var(--border);border-radius:var(--r);padding:16px}
    .dv{font-size:22px;font-weight:800;margin-bottom:3px}
    .dk{font-size:12px;color:var(--text-3);font-weight:500;text-transform:uppercase;letter-spacing:.04em}
    /* Map */
    .map-wrap{position:relative;border-radius:var(--rl);overflow:hidden;border:1px solid var(--border);height:340px;background:var(--bg-2);margin-bottom:8px}
    #zip-map{width:100%;height:100%}
    .map-legend{position:absolute;bottom:12px;right:12px;z-index:1000;background:rgba(255,255,255,.95);border:1px solid var(--border);border-radius:var(--r);padding:10px 14px;font-size:12px;backdrop-filter:blur(4px)}
    .map-legend-title{font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3);margin-bottom:6px}
    .ml-row{display:flex;align-items:center;gap:6px;margin-bottom:3px}
    .ml-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0}
    /* Search */
    .search-row{display:flex;gap:10px;margin:16px 0 10px}
    .sinput{flex:1;padding:11px 16px;border:1.5px solid var(--border);border-radius:var(--r);font-size:15px;font-family:var(--font);outline:none;transition:border .15s}
    .sinput:focus{border-color:var(--green)}
    .sbtn{padding:11px 22px;background:var(--green);color:#fff;border:none;border-radius:var(--r);font-size:15px;font-weight:600;cursor:pointer;font-family:var(--font)}
    .sbtn:hover{background:var(--green-h)}
    .chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
    .chip{padding:6px 14px;background:var(--bg-2);border:1px solid var(--border);border-radius:20px;font-size:13px;font-weight:500;cursor:pointer;font-family:var(--font);transition:all .15s}
    .chip:hover{border-color:var(--green);color:var(--green);background:var(--green-l)}
    .rc{background:#fff;border:1px solid var(--border);border-radius:var(--r);padding:16px 18px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
    .rn{font-weight:600;font-size:15px;margin-bottom:3px}
    .rm{font-size:13px;color:var(--text-2)}
    .rb{font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;background:var(--green-l);color:var(--green-t);white-space:nowrap}
    /* CTA band */
    .cta-band{background:var(--bg-dark);color:#fff;border-radius:var(--rl);padding:44px 36px;text-align:center;margin-bottom:52px}
    .cta-band h2{font-size:26px;font-weight:800;margin-bottom:10px}
    .cta-band p{color:#9ca3af;font-size:15px;margin-bottom:28px;max-width:480px;margin-left:auto;margin-right:auto}
    .btn-w{background:#fff;color:var(--bg-dark);font-weight:700}
    .btn-w:hover{background:var(--green-l);color:var(--green-t)}
    /* Other ZIPs */
    .zip-links{display:flex;flex-wrap:wrap;gap:12px;margin-top:16px;margin-bottom:52px}
    .zl{padding:10px 18px;background:var(--bg-2);border:1px solid var(--border);border-radius:var(--r);font-size:14px;font-weight:600;color:var(--text-2);transition:all .15s}
    .zl:hover{border-color:var(--green);color:var(--green);background:var(--green-l)}
    /* Footer */
    footer{border-top:1px solid var(--border);padding:32px 24px}
    .fi{max-width:var(--max);margin:0 auto;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px}
    .fc{font-size:13px;color:var(--text-3)}
    .fl{display:flex;gap:20px}
    .fl a{font-size:13px;color:var(--text-3)}
    .fl a:hover{color:var(--green)}
    .loading-msg{color:var(--text-3);font-size:14px;padding:12px 0}
    /* Market Brief */
    .brief-card{background:var(--bg-2);border:1px solid var(--border);border-radius:var(--rl);padding:24px 28px;margin-bottom:52px}
    .brief-narrative{font-size:16px;color:var(--text);line-height:1.7;margin-bottom:16px}
    .brief-meta{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
    .brief-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:3px 9px;border-radius:20px;border:1px solid var(--border);color:var(--text-3)}
    .brief-badge.est{border-color:#fbbf24;color:#92400e;background:#fffbeb}
    .brief-badge.verified{border-color:var(--green);color:var(--green-t);background:var(--green-l)}
    .opp-score{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:var(--text-2)}
    .opp-bar{height:6px;border-radius:3px;background:var(--border);width:80px;overflow:hidden}
    .opp-fill{height:100%;border-radius:3px;background:var(--green)}
    /* Top Questions */
    .qa-list{display:flex;flex-direction:column;gap:12px;margin-bottom:52px}
    .qa{background:#fff;border:1px solid var(--border);border-radius:var(--rl);padding:20px 24px}
    .qa-q{font-size:15px;font-weight:700;margin-bottom:8px;color:var(--text)}
    .qa-a{font-size:14px;color:var(--text-2);line-height:1.6}
    .qa-sig{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:2px 7px;border-radius:20px;margin-top:10px}
    .qa-sig.moderate{background:#ffedd5;color:#9a3412}
    .qa-sig.low{background:#e5e7eb;color:#6b7280}
    .qa-sig.high{background:#dcfce7;color:#166534}
    /* Restaurant signal */
    .rest-card{background:var(--bg-2);border:1px solid var(--border);border-radius:var(--rl);padding:24px 28px;margin-bottom:52px}
    .rest-stat-row{display:flex;flex-wrap:wrap;gap:24px;margin-bottom:20px}
    .rest-stat{display:flex;flex-direction:column}
    .rest-stat-val{font-size:26px;font-weight:800;line-height:1}
    .rest-stat-lbl{font-size:11px;color:var(--text-3);margin-top:3px;text-transform:uppercase;letter-spacing:.04em;font-weight:600}
    .rest-stat-val.over{color:#dc2626}
    .rest-stat-val.under{color:var(--green)}
    .rest-stat-val.neutral{color:var(--text)}
    .tier-bar{display:flex;flex-direction:column;gap:8px}
    .tier-row{display:flex;align-items:center;gap:10px;font-size:13px}
    .tier-lbl{width:80px;color:var(--text-2);font-weight:600;flex-shrink:0}
    .tier-track{flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden}
    .tier-fill{height:100%;border-radius:4px}
    .tier-count{font-size:12px;color:var(--text-3);width:24px;text-align:right;flex-shrink:0}
    /* Growth signals */
    .growth-strip{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:52px}
    .gs{background:var(--bg-2);border:1px solid var(--border);border-radius:var(--r);padding:14px 18px;flex:1;min-width:140px}
    .gs-val{font-size:20px;font-weight:800;margin-bottom:2px}
    .gs-lbl{font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.04em;font-weight:600}
    @media(max-width:640px){.hero{padding:44px 18px 40px}.main{padding:36px 18px}.nav-links a:not(.cta){display:none}}
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  // Google Fonts
  const gf = document.createElement('link');
  gf.rel = 'stylesheet';
  gf.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300..800&display=swap';
  document.head.appendChild(gf);

  // ── Build DOM ───────────────────────────────────────────────────────────────
  document.body.innerHTML = `
    <nav>
      <div class="ni">
        <a href="/" class="logo"><div class="logo-dot"></div>LocalIntel</a>
        <div class="nav-links">
          <a href="/">Home</a>
          <a href="/search.html">Search</a>
          <a href="/claim.html" class="cta">Claim Listing</a>
        </div>
      </div>
    </nav>

    <section class="hero">
      <div class="hi">
        <div class="bc"><a href="/">LocalIntel</a> › <a href="/#explore">Northeast Florida</a> › ${NAME}</div>
        <div class="zbadge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ZIP ${ZIP} · ${COUNTY} County
        </div>
        <h1>${NAME}, FL<br>Business Intelligence</h1>
        <p class="hsub">Live business intelligence for ${NAME} — ${desc}. Market gaps, sector signals, and commercial data updated continuously.</p>
        <div class="hstats">
          <div class="stat"><span class="snum" id="s-biz">—</span><span class="slbl">Businesses Tracked</span></div>
          <div class="stat"><span class="snum" id="s-pop">—</span><span class="slbl">Residents</span></div>
          <div class="stat"><span class="snum" id="s-hhi">—</span><span class="slbl">Median HH Income</span></div>
          <div class="stat"><span class="snum" id="s-profile">—</span><span class="slbl">Market Profile</span></div>
        </div>
        <div class="hctas">
          <a href="/search.html?zip=${ZIP}" class="btn btn-p">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Search ${NAME} Businesses
          </a>
          <a href="/claim.html" class="btn btn-s">Claim Your Listing</a>
        </div>
      </div>
    </section>

    <main class="main">

      <!-- Market Brief -->
      <div class="brief-card" id="brief-card" style="display:none">
        <p class="brief-narrative" id="brief-narrative"></p>
        <div class="brief-meta">
          <span class="brief-badge est" id="brief-conf-badge"></span>
          <span class="opp-score">Opportunity score: <span id="brief-opp-score">—</span>/100 <div class="opp-bar"><div class="opp-fill" id="brief-opp-bar" style="width:0%"></div></div></span>
        </div>
      </div>

      <!-- Top Questions -->
      <h2 class="sec-title" id="qa-title" style="display:none">Market Q&amp;A — <span>${NAME}</span></h2>
      <p class="sec-sub" id="qa-sub" style="display:none">Real questions agents ask about this market. Answers derived from live indexed data.</p>
      <div class="qa-list" id="qa-list"></div>

      <!-- Restaurant Signal -->
      <div id="rest-section" style="display:none;margin-bottom:0">
        <h2 class="sec-title">Restaurant Signal — <span>${ZIP}</span></h2>
        <p class="sec-sub">Food &amp; beverage market saturation based on population, income, and business counts.</p>
        <div class="rest-card">
          <div class="rest-stat-row" id="rest-stats"></div>
          <div class="tier-bar" id="tier-bar"></div>
        </div>
      </div>

      <!-- Growth Signals -->
      <h2 class="sec-title" id="growth-title" style="display:none">Growth Signals — <span>${NAME}</span></h2>
      <p class="sec-sub" id="growth-sub" style="display:none">Infrastructure momentum, construction activity, and trajectory.</p>
      <div class="growth-strip" id="growth-strip" style="margin-bottom:52px"></div>

      <h2 class="sec-title">Sector Signals — <span>${ZIP}</span></h2>
      <p class="sec-sub" id="gap-sub">Live market signals. Full analysis available to verified business owners.</p>
      <div class="gap-grid" id="gap-grid"><p class="loading-msg">Loading sector data…</p></div>

      <h2 class="sec-title">Industry Breakdown — <span>${COUNTY} County</span></h2>
      <p class="sec-sub">County-level establishment counts by NAICS sector. U.S. Census Bureau CBP 2023.</p>
      <div class="ind-grid" id="ind-grid"><p class="loading-msg">Loading industry data…</p></div>

      <h2 class="sec-title">Permit Activity — <span>Last 6 Months</span></h2>
      <p class="sec-sub" id="permit-sub">Construction and development signals from county GIS permit databases.</p>
      <div class="permit-gate" id="permit-gate">
        <!-- blurred teaser numbers — populated by renderPermits() -->
        <div class="permit-blurred" id="permit-blurred">
          <div class="permit-blur-row"><span class="permit-blur-lbl">Commercial Permits</span><span class="permit-blur-val" id="pb-commercial">—</span></div>
          <div class="permit-blur-row"><span class="permit-blur-lbl">Residential Permits</span><span class="permit-blur-val" id="pb-residential">—</span></div>
          <div class="permit-blur-row"><span class="permit-blur-lbl">Total Permits (6 mo)</span><span class="permit-blur-val" id="pb-total">—</span></div>
        </div>
        <div class="permit-cta">
          <span class="permit-lock-label">🔒 Premium Signal</span>
          <div class="permit-lock-msg">Permit activity data is available with a paid market consultation.</div>
          <div class="permit-lock-sub">Get the full breakdown — commercial vs. residential, trend direction, and what it means for your category in ${ZIP}.</div>
          <a class="permit-consult-btn" href="/consult.html?ref=permit&zip=${ZIP}">Get Market Consultation →</a>
        </div>
      </div>

      <h2 class="sec-title">Demographics — <span>${NAME}</span></h2>
      <div class="demo-grid" style="margin-top:16px">
        <div class="dc"><div class="dv" id="d-pop">—</div><div class="dk">Population</div></div>
        <div class="dc"><div class="dv" id="d-hh">—</div><div class="dk">Households</div></div>
        <div class="dc"><div class="dv" id="d-hhi">—</div><div class="dk">Median HH Income</div></div>
        <div class="dc"><div class="dv" id="d-agi">—</div><div class="dk">IRS Median AGI</div></div>
        <div class="dc"><div class="dv" id="d-biz">—</div><div class="dk">Businesses Indexed</div></div>
        <div class="dc"><div class="dv" id="d-dom">—</div><div class="dk">Dominant Sector</div></div>
        <div class="dc"><div class="dv" id="d-profile">—</div><div class="dk">Consumer Profile</div></div>
        <div class="dc"><div class="dv" id="d-growth">—</div><div class="dk">Growth State</div></div>
      </div>

      <div style="margin-bottom:52px">
        <h2 class="sec-title">Market Map — <span>${ZIP}</span></h2>
        <p class="sec-sub" id="map-sub">Business locations — claimed (green) vs unclaimed (grey).</p>
        <div class="map-wrap">
          <div id="zip-map"><div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-3);font-size:14px">Loading map…</div></div>
          <div class="map-legend">
            <div class="map-legend-title">Businesses</div>
            <div class="ml-row"><div class="ml-dot" style="background:#16a34a"></div><span>Claimed</span></div>
            <div class="ml-row"><div class="ml-dot" style="background:#9CA3AF"></div><span>Unclaimed</span></div>
          </div>
        </div>
      </div>

      <div style="margin-bottom:52px">
        <h2 class="sec-title" style="margin-bottom:6px">Search <span>${NAME}</span> Businesses</h2>
        <p style="font-size:14px;color:var(--text-2);margin-bottom:0">All industries — live data from ${ZIP}</p>
        <div class="search-row">
          <input type="text" class="sinput" id="sinput" placeholder="dentist, contractor, wine bar, gym…">
          <button class="sbtn" id="sbtn">Search</button>
        </div>
        <div class="chips" id="chips"></div>
        <div id="results"></div>
      </div>

      <div class="cta-band">
        <h2>Is your business listed in ${NAME}?</h2>
        <p>Claim your free listing to appear in agent searches, receive job alerts, and see your full sector report.</p>
        <a href="/claim.html" class="btn btn-w">Claim Your Free Listing →</a>
      </div>

      <h2 class="sec-title">Neighborhoods in <span>${NAME}</span></h2>
      <div class="zip-links" id="hood-links"><p class="loading-msg">Loading…</p></div>

      <h2 class="sec-title">More <span>${COUNTY} County</span> Markets</h2>
      <div class="zip-links" id="related-zips"><p class="loading-msg">Loading…</p></div>

    </main>

    <footer>
      <div class="fi">
        <div class="fc">© 2026 LocalIntel — Florida Business Intelligence</div>
        <div class="fl">
          <a href="/">Home</a>
          <a href="/search.html">Search</a>
          <a href="/claim.html">Claim Listing</a>
          <a href="tel:+19045067476">(904) 506-7476</a>
        </div>
      </div>
    </footer>
  `;

  // ── Quick search chips ──────────────────────────────────────────────────────
  const CHIPS = ['Restaurants','Healthcare','Contractors','Retail','Fitness','Wine & Spirits'];
  document.getElementById('chips').innerHTML = CHIPS
    .map(c => `<button class="chip" data-q="${c.toLowerCase()}">${c}</button>`).join('');
  document.getElementById('chips').addEventListener('click', e => {
    const q = e.target.dataset.q;
    if (q) { document.getElementById('sinput').value = q; doSearch(); }
  });
  document.getElementById('sbtn').addEventListener('click', doSearch);
  document.getElementById('sinput').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

  // ── Related ZIPs (same county) ──────────────────────────────────────────────
  const COUNTY_ZIPS = {
    'St. Johns': [{zip:'32081',name:'Nocatee'},{zip:'32082',name:'Ponte Vedra Beach'},{zip:'32092',name:'World Golf Village'},{zip:'32084',name:'St. Augustine'},{zip:'32086',name:'St. Augustine South'},{zip:'32095',name:'Palm Valley'},{zip:'32080',name:'St. Augustine Beach'},{zip:'32259',name:'Fruit Cove'}],
    'Duval':     [{zip:'32250',name:'Jacksonville Beach'},{zip:'32266',name:'Neptune Beach'},{zip:'32258',name:'Bartram Park'},{zip:'32226',name:'North Jacksonville'},{zip:'32256',name:'Baymeadows'},{zip:'32257',name:'Mandarin South'},{zip:'32224',name:'Intracoastal'},{zip:'32225',name:'Arlington'},{zip:'32246',name:'Regency'},{zip:'32233',name:'Atlantic Beach'},{zip:'32211',name:'Jacksonville East'},{zip:'32216',name:'Southside Blvd'},{zip:'32217',name:'San Jose'},{zip:'32207',name:'Southbank'},{zip:'32223',name:'Mandarin'},{zip:'32205',name:'Avondale'},{zip:'32210',name:'Wesconnett'},{zip:'32218',name:'NW Jacksonville'},{zip:'32244',name:'Westside'}],
    'Clay':      [{zip:'32003',name:'Fleming Island'},{zip:'32065',name:'Oakleaf'},{zip:'32073',name:'Orange Park'},{zip:'32043',name:'Green Cove Springs'}],
    'Nassau':    [{zip:'32034',name:'Fernandina Beach'},{zip:'32097',name:'Yulee'}],
    'Volusia':   [{zip:'32168',name:'New Smyrna Beach'},{zip:'32174',name:'Ormond Beach'},{zip:'32117',name:'Daytona North'},{zip:'32118',name:'Daytona Beach'}],
    'Flagler':   [{zip:'32136',name:'Flagler Beach'},{zip:'32137',name:'Palm Coast'}],
    'Putnam':    [{zip:'32177',name:'Palatka'}],
    'Alachua':   [{zip:'32608',name:'Gainesville West'},{zip:'32601',name:'Gainesville'}],
  };
  const related = (COUNTY_ZIPS[COUNTY] || []).filter(z => z.zip !== ZIP).slice(0, 6);
  document.getElementById('related-zips').innerHTML = related.length
    ? related.map(z => `<a href="/zip/${z.zip}" class="zl">${z.zip} — ${z.name}</a>`).join('')
    : '<a href="/" class="zl">← All Markets</a>';

  // ── Neighborhood links for this ZIP ───────────────────────────────────
  const hoodEl = document.getElementById('hood-links');
  fetch(`${RAILWAY}/api/local-intel/zip-neighborhoods?zip=${ZIP}`)
    .then(r => r.json())
    .then(d => {
      const hoods = d.neighborhoods || [];
      hoodEl.innerHTML = hoods.length
        ? hoods.map(h => `<a href="/neighborhood/${h.slug}" class="zl">${h.name}</a>`).join('')
        : '<span style="color:var(--text-muted);font-size:13px">Neighborhood data coming soon.</span>';
    })
    .catch(() => { hoodEl.innerHTML = ''; hoodEl.closest('*').style.display='none'; });

  // ── Gap engine ──────────────────────────────────────────────────────────────
  const BENCHMARKS = [
    {key:'health',       label:'Healthcare',           icon:'🏥', base:27.6, inc:1.15},
    {key:'food',         label:'Food & Dining',         icon:'🍽️', base:27.7, inc:1.10},
    {key:'retail',       label:'Retail & Shopping',     icon:'🛍️', base:20.0, inc:1.10},
    {key:'fitness',      label:'Fitness & Wellness',    icon:'💪', base:4.0,  inc:1.15},
    {key:'finance',      label:'Financial Services',    icon:'🏦', base:8.0,  inc:1.15},
    {key:'hospitality',  label:'Hospitality',           icon:'🏨', base:3.0,  inc:1.00},
    {key:'legal',        label:'Legal Services',        icon:'⚖️', base:5.4,  inc:1.20},
    {key:'construction', label:'Construction & Trades', icon:'🔨', base:17.8, inc:1.00},
    {key:'automotive',   label:'Automotive Services',   icon:'🚗', base:5.1,  inc:0.90},
    {key:'services',     label:'Professional Services', icon:'💼', base:91.2, inc:1.10},
  ];
  const TIER_META = {
    high:     {lbl:'Significant Opportunity', sub:'Meaningfully undersupplied relative to market size.',       cls:'urgent'   },
    medium:   {lbl:'Moderate Opportunity',    sub:'Room for new concepts — moderate competition expected.',    cls:'moderate' },
    low:      {lbl:'Slight Opportunity',      sub:'Minor gap — niche or specialty concepts may find footing.', cls:'slight'   },
    balanced: {lbl:'Balanced Market',         sub:'Supply roughly matches demand for this sector.',             cls:'balanced' },
    saturated:{lbl:'Competitive Market',      sub:'Well-supplied — existing operators face pricing pressure.',  cls:'saturated'},
  };
  const MT = {
    growth:      {high:.30,medium:.15,low:.05,saturated:-.20},
    established: {high:.40,medium:.20,low:.08,saturated:-.25},
    mature:      {high:.50,medium:.25,low:.10,saturated:-.30},
  };
  function computeGaps(sb, pop, hhi, maturity) {
    const p10 = pop / 10000, aff = hhi > 100000;
    const T = MT[maturity] || MT.established;
    return BENCHMARKS.map(s => {
      const actual   = sb[s.key] || 0;
      const expected = Math.max(1, Math.round(s.base * (aff ? s.inc : 1.0) * p10));
      const gapPct   = (expected - actual) / expected;
      const tier     = gapPct >= T.high ? 'high' : gapPct >= T.medium ? 'medium' : gapPct >= T.low ? 'low' : gapPct <= T.saturated ? 'saturated' : 'balanced';
      return {...s, actual, expected, gapPct, tier};
    }).sort((a,b) => b.gapPct - a.gapPct);
  }
  function renderGaps(gaps) {
    const grid = document.getElementById('gap-grid');
    const show = gaps.filter(g => g.tier !== 'balanced').slice(0, 8);
    if (!show.length) { grid.innerHTML = '<p class="loading-msg">Sector data unavailable.</p>'; return; }
    document.getElementById('gap-sub').textContent =
      show.filter(g => g.gapPct > 0).length + ' undersupplied sectors detected. Full breakdown available to verified business owners.';
    grid.innerHTML = show.map(g => {
      const t = TIER_META[g.tier];
      return `<div class="gc ${t.cls}"><div class="gc-icon">${g.icon}</div><div class="gc-sector">${g.label}</div><div class="gc-label ${t.cls}">${t.lbl}</div><div class="gc-sub">${t.sub}</div><div class="gc-gate"><span class="gc-gate-lbl">Detailed data available</span><a href="/claim.html" class="gc-gate-btn">See Full Report →</a></div></div>`;
    }).join('');
  }

  // ── Industry breakdown ──────────────────────────────────────────────────────
  function renderIndustry(sectors, pop) {
    const grid = document.getElementById('ind-grid');
    if (!sectors || !sectors.length) {
      grid.innerHTML = '<p class="loading-msg">No county industry data available yet.</p>';
      return;
    }
    grid.innerHTML = sectors.slice(0, 10).map(s => {
      const per1k = pop > 0 ? (s.establishments / pop * 1000).toFixed(1) : null;
      const d = per1k
        ? parseFloat(per1k) > 5 ? {cls:'dense', lbl:'Dense'}
        : parseFloat(per1k) > 2 ? {cls:'bal',   lbl:'Balanced'}
        :                         {cls:'under',  lbl:'Underserved'}
        : null;
      return `<div class="ic"><div class="ic-label">${esc(s.label)}</div><div class="ic-estab">${s.establishments.toLocaleString()}</div><div class="ic-sub">establishments · ${s.county_emp_share_pct}% county jobs</div>${d ? `<span class="ic-badge ${d.cls}">${per1k}/1k · ${d.lbl}</span>` : ''}</div>`;
    }).join('');
  }

  // Permits (gated premium) — gate is always visible.
  // If real permit numbers exist, populate the blurred teaser values.
  function renderPermits(permits) {
    if (permits && permits.total) {
      document.getElementById('pb-commercial').textContent = permits.commercial || 0;
      document.getElementById('pb-residential').textContent = permits.residential || 0;
      document.getElementById('pb-total').textContent = permits.total;
      document.getElementById('permit-sub').textContent =
        `${permits.total} permits filed in the last 6 months — full breakdown requires consultation.`;
    } else {
      document.getElementById('permit-sub').textContent =
        'Construction and development signals — full breakdown requires consultation.';
    }
  }

  // ── Leaflet map ─────────────────────────────────────────────────────────────
  let _map = null;
  async function initMap() {
    if (!window.L) {
      await Promise.all([loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'), loadStyle('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css')]);
    }
    if (_map) { _map.remove(); _map = null; }
    const el = document.getElementById('zip-map');
    el.innerHTML = '';
    _map = window.L.map('zip-map', {zoomControl:true, scrollWheelZoom:false});

    // Light CartoDB tiles
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd', maxZoom: 19
    }).addTo(_map);

    _map.setView([LAT, LON], 13);

    // Fetch boundary data — ZIP polygon + sibling context + business dots
    try {
      const bdata = await fetch(`${RAILWAY}/api/local-intel/zip-boundary?zip=${ZIP}`).then(r => r.json());

      // 1. Draw sibling ZIP boundaries (faint context ring — neighbourhood outline)
      const siblings = bdata.sibling_boundaries || [];
      siblings.forEach(sb => {
        if (!sb.boundary_geojson) return;
        window.L.geoJSON(sb.boundary_geojson, {
          style: { color:'#4a5568', weight:1, opacity:0.5, fillColor:'#4a5568', fillOpacity:0.03 }
        }).addTo(_map);
      });

      // 2. Draw primary ZIP boundary (bright outline)
      if (bdata.zip_intelligence && bdata.zip_intelligence.boundary_geojson) {
        const primary = window.L.geoJSON(bdata.zip_intelligence.boundary_geojson, {
          style: { color:'#16A34A', weight:2, opacity:0.8, fillColor:'#16A34A', fillOpacity:0.05 }
        }).addTo(_map);
        // Fit map to this ZIP's polygon
        _map.fitBounds(primary.getBounds(), {padding:[20,20]});
      }

      // 3. Business dots
      const businesses = bdata.businesses || [];
      let bizCount = 0;
      businesses.forEach(b => {
        if (!b.lat || !b.lon) return;
        const claimed = !!b.is_claimed;
        const color = claimed ? '#16A34A' : '#9CA3AF';
        window.L.circleMarker([parseFloat(b.lat), parseFloat(b.lon)], {
          radius: claimed ? 6 : 4,
          fillColor: color, color:'#111', weight:1, fillOpacity:0.85
        }).addTo(_map)
          .bindTooltip(
            `<strong>${esc(b.name)}</strong><br><span style="color:#9ca3af;font-size:11px">${esc(b.category||'')}</span>`,
            {direction:'top', offset:[0,-6]}
          );
        bizCount++;
      });

      // Neighbourhood context chips below map
      const hoods = bdata.neighborhoods || [];
      if (hoods.length) {
        const hoodLinks = hoods.map(h =>
          `<a href="/neighborhood/${h.slug}" style="color:#00e676;text-decoration:none">← ${h.name} (${h.region})</a>`
        ).join(' &nbsp;·&nbsp; ');
        document.getElementById('map-sub').innerHTML =
          `${bizCount} businesses mapped · Part of: ${hoodLinks}`;
      } else {
        document.getElementById('map-sub').textContent = `${bizCount} businesses mapped`;
      }

    } catch(err) {
      // Fallback: just show pins from old endpoint
      try {
        const data = await fetch(`${RAILWAY}/api/local-intel/pins?zip=${ZIP}`).then(r => r.json());
        const pins = data.pins || [];
        pins.forEach(p => {
          const color = p.claimed ? '#16A34A' : '#9CA3AF';
          window.L.circleMarker([p.lat, p.lon], {radius:p.claimed?6:4, fillColor:color, color:'#111', weight:1, fillOpacity:0.85})
            .addTo(_map)
            .bindTooltip(`<strong>${esc(p.name)}</strong>`, {direction:'top'});
        });
        document.getElementById('map-sub').textContent = `${pins.length} businesses mapped`;
      } catch { document.getElementById('map-sub').textContent = 'Map data unavailable.'; }
    }
  }

  // ── Search ──────────────────────────────────────────────────────────────────
  async function doSearch() {
    const q = document.getElementById('sinput').value.trim();
    if (!q) return;
    const area = document.getElementById('results');
    area.innerHTML = '<p class="loading-msg">Searching…</p>';
    try {
      const data = await fetch(`${RAILWAY}/api/local-intel`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({zip:ZIP, query:q, limit:8})}).then(r => r.json());
      const rows = data.results || [];
      area.innerHTML = rows.length
        ? rows.map(b => `<div class="rc"><div><div class="rn">${esc(b.name)}</div><div class="rm">${[b.address,b.phone,b.category?.replace(/_/g,' ')].filter(Boolean).join(' · ')}</div></div><div class="rb">${esc(b.matchReason||b.category||'Business')}</div></div>`).join('')
        : '<p class="loading-msg">No results — try a different search.</p>';
    } catch { area.innerHTML = '<p class="loading-msg">Search unavailable.</p>'; }
  }

  // ── Load all data ───────────────────────────────────────────────────────────
  async function loadAll() {
    try {
      const [oracle, census] = await Promise.all([
        fetch(`${RAILWAY}/api/local-intel/oracle?zip=${ZIP}`).then(r => r.json()),
        fetch(`${RAILWAY}/api/local-intel/census?zip=${ZIP}`).then(r => r.json()),
      ]);

      const dem = oracle?.demographics || {};
      const mi  = oracle?.market_intelligence || {};
      const biz = oracle?.data_sources?.businesses_indexed;
      const pop = dem.population || 0;
      const hhi = dem.median_household_income || 0;

      if (biz)              { document.getElementById('s-biz').textContent = biz.toLocaleString(); document.getElementById('d-biz').textContent = biz.toLocaleString(); }
      if (pop)              { document.getElementById('s-pop').textContent = pop.toLocaleString(); document.getElementById('d-pop').textContent = pop.toLocaleString(); }
      if (hhi)              { document.getElementById('s-hhi').textContent = '$' + Math.round(hhi/1000) + 'k'; document.getElementById('d-hhi').textContent = '$' + hhi.toLocaleString(); }
      if (dem.total_households) document.getElementById('d-hh').textContent = dem.total_households.toLocaleString();
      if (dem.consumer_profile) {
        const p = dem.consumer_profile.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
        document.getElementById('s-profile').textContent = p.split(' ')[0];
        document.getElementById('d-profile').textContent = p;
      }
      if (mi.dominant_sector) document.getElementById('d-dom').textContent = mi.dominant_sector.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
      if (oracle.growth_state || oracle.market_maturity) document.getElementById('d-growth').textContent = (oracle.growth_state || oracle.market_maturity || '—').replace(/_/g,' ');

      // ── Market Brief ───────────────────────────────────────────────────────
      const narrative = oracle.oracle_narrative;
      const oppScore  = mi.market_opportunity_score || 0;
      const confTier  = oracle.economic_layer?.data_confidence?.confidence_tier || 'ESTIMATED';
      if (narrative) {
        document.getElementById('brief-narrative').textContent = narrative;
        document.getElementById('brief-opp-score').textContent = oppScore;
        document.getElementById('brief-opp-bar').style.width = oppScore + '%';
        const cb = document.getElementById('brief-conf-badge');
        cb.textContent = confTier === 'VERIFIED' ? '✓ Verified Data' : 'Estimated Data';
        cb.className   = 'brief-badge ' + (confTier === 'VERIFIED' ? 'verified' : 'est');
        document.getElementById('brief-card').style.display = 'block';
      }

      // ── Top Questions ──────────────────────────────────────────────────────
      const tqs = oracle.top_questions || [];
      if (tqs.length) {
        document.getElementById('qa-title').style.display = '';
        document.getElementById('qa-sub').style.display   = '';
        document.getElementById('qa-list').innerHTML = tqs.map(q => `
          <div class="qa">
            <div class="qa-q">${esc(q.question)}</div>
            <div class="qa-a">${esc(q.answer)}</div>
            <span class="qa-sig ${esc(q.signal_strength || 'low')}">${(q.signal_strength || 'low').toUpperCase()} SIGNAL</span>
          </div>`).join('');
      }

      // ── Restaurant Signal ─────────────────────────────────────────────────
      const rc = oracle.restaurant_capacity;
      if (rc && rc.restaurant_count > 0) {
        document.getElementById('rest-section').style.display = 'block';
        const capRate   = rc.capture_rate_pct || 0;
        const satStatus = rc.saturation_status || 'unknown';
        const satColor  = capRate > 110 ? 'over' : capRate < 80 ? 'under' : 'neutral';
        const satLabel  = capRate > 110 ? 'Oversaturated' : capRate < 80 ? 'Undersupplied' : 'Balanced';
        document.getElementById('rest-stats').innerHTML = `
          <div class="rest-stat"><div class="rest-stat-val ${satColor}">${capRate}%</div><div class="rest-stat-lbl">Capture Rate</div></div>
          <div class="rest-stat"><div class="rest-stat-val neutral">${rc.restaurant_count}</div><div class="rest-stat-lbl">Food Businesses</div></div>
          <div class="rest-stat"><div class="rest-stat-val neutral">${rc.restaurants_market_can_support || '—'}</div><div class="rest-stat-lbl">Market Can Support</div></div>
          <div class="rest-stat"><div class="rest-stat-val ${satColor}">${satLabel}</div><div class="rest-stat-lbl">Status</div></div>`;
        const tiers = rc.tier_breakdown || {};
        const tierOrder = [['fine','Fine Dining','#6d28d9'],['upscale','Upscale','#2563eb'],['midrange','Mid-Range','#0891b2'],['budget','Budget','#16a34a']];
        const maxTier = Math.max(...tierOrder.map(([k]) => tiers[k] || 0), 1);
        document.getElementById('tier-bar').innerHTML = tierOrder
          .filter(([k]) => (tiers[k] || 0) > 0)
          .map(([k, lbl, color]) => `
            <div class="tier-row">
              <div class="tier-lbl">${lbl}</div>
              <div class="tier-track"><div class="tier-fill" style="width:${Math.round(((tiers[k]||0)/maxTier)*100)}%;background:${color}"></div></div>
              <div class="tier-count">${tiers[k] || 0}</div>
            </div>`).join('');
      }

      // ── Growth Signals ────────────────────────────────────────────────────
      const gt = oracle.growth_trajectory;
      if (gt) {
        document.getElementById('growth-title').style.display = '';
        document.getElementById('growth-sub').style.display   = '';
        const infra = gt.infrastructure_momentum || 0;
        const infraColor = infra >= 50 ? '#16a34a' : infra >= 25 ? '#d97706' : '#6b7280';
        document.getElementById('growth-strip').innerHTML = `
          <div class="gs"><div class="gs-val" style="color:#16a34a">${esc(gt.label || gt.state || '—')}</div><div class="gs-lbl">Trajectory</div></div>
          <div class="gs"><div class="gs-val" style="color:${infraColor}">${infra}/100</div><div class="gs-lbl">Infrastructure Momentum</div></div>
          <div class="gs"><div class="gs-val">${gt.flood_zone_pct || 0}%</div><div class="gs-lbl">Flood Zone Coverage</div></div>
          <div class="gs"><div class="gs-val">${gt.active_construction || 0}</div><div class="gs-lbl">Active Construction Sites</div></div>
          <div class="gs"><div class="gs-val">${dem.owner_occupied_pct || 0}%</div><div class="gs-lbl">Owner-Occupied Homes</div></div>`;
      }

      if (mi.sector_breakdown) {
        renderGaps(computeGaps(mi.sector_breakdown, pop, hhi, oracle.market_maturity || 'established'));
      } else {
        document.getElementById('gap-grid').innerHTML = '<p class="loading-msg">Sector data unavailable.</p>';
      }

      // Census data
      if (census.available !== false) {
        renderIndustry(census.county_industry_breakdown || [], pop);
        renderPermits(census.permit_signals_6mo);
        if (census.income?.irs_agi_median) document.getElementById('d-agi').textContent = '$' + Math.round(census.income.irs_agi_median/1000) + 'k';
        if (census.income?.irs_returns)    document.getElementById('d-hh').textContent  = census.income.irs_returns.toLocaleString();
      } else {
        document.getElementById('ind-grid').innerHTML = '<p class="loading-msg">Industry data not yet available for this ZIP.</p>';
        renderPermits(null);
      }

      initMap();
    } catch(e) {
      document.getElementById('gap-grid').innerHTML  = '<p class="loading-msg">Unable to load live data.</p>';
      document.getElementById('ind-grid').innerHTML  = '<p class="loading-msg">Unable to load industry data.</p>';
      document.getElementById('permit-sub').textContent = 'Construction and development signals — full breakdown requires consultation.';
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function loadScript(src) { return new Promise((res,rej)=>{ const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s); }); }
  function loadStyle(href)  { return new Promise(res=>{ const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.onload=res;document.head.appendChild(l); }); }

  loadAll();
})();
