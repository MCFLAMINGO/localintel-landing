/**
 * _biz-page.js — LocalIntel Business Page Client Renderer
 * Shared by all /biz/{slug}.html pages. window.BIZ_CONFIG is injected per page.
 */
(function () {
  'use strict';

  const cfg     = window.BIZ_CONFIG || {};
  const SITE    = 'https://www.thelocalintel.com';
  const RAILWAY = 'https://gsb-swarm-production.up.railway.app';

  function publicWebsite(biz) {
    const w = String(biz.website || '').trim();
    if (!w) return '';
    if (/thelocalintel\.com\/(inbox|login|claim|merchant)/i.test(w)) return '';
    return w;
  }

  function websiteHostLabel(url) {
    try {
      return new URL(url.includes('://') ? url : 'https://' + url).hostname.replace(/^www\./i, '');
    } catch {
      return url.replace(/^https?:\/\//i, '');
    }
  }

  function loadSponsors() {
    if (typeof window.__liSponsorsInject === 'function') {
      window.__liSponsorsInject();
      return;
    }
    if (document.querySelector('script[src="/_sponsors.js"]')) return;
    const s = document.createElement('script');
    s.src = '/_sponsors.js';
    s.onload = function () {
      if (typeof window.__liSponsorsInject === 'function') window.__liSponsorsInject();
    };
    document.head.appendChild(s);
  }

  function ownerLoginHref(biz) {
    const qs = new URLSearchParams();
    if (biz.business_id) qs.set('biz', biz.business_id);
    if (biz.name) qs.set('name', biz.name);
    if (biz.zip) qs.set('zip', biz.zip);
    if (biz.website) qs.set('website', biz.website);
    return `/login?${qs.toString()}`;
  }

  function label(cat) {
    return (cat || 'Local Business').replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  function render(biz) {
    document.title = `${biz.name} — ${label(biz.category)} in ${biz.city} | LocalIntel`;
    const site = publicWebsite(biz);
    const host = site ? websiteHostLabel(site) : '';
    const cta = site
      ? `<div style="margin-bottom:8px;">
          <a href="${site}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none;margin:0 10px 16px 0;">Visit ${host} →</a>
          <a href="${biz.order_url}" style="display:inline-block;color:#16a34a;font-weight:600;font-size:14px;text-decoration:none;margin:0 0 16px;">Request a quote via LocalIntel</a>
        </div>`
      : `<a href="${biz.order_url}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none;margin-bottom:24px;">
          Request a Quote / Place an Order →
        </a>`;

    document.body.innerHTML = `
      <div id="biz-page" style="font-family:system-ui,sans-serif;max-width:680px;margin:0 auto;padding:24px 20px;">
        <a href="${SITE}" style="font-size:13px;color:#16a34a;text-decoration:none;">← LocalIntel</a>

        <div style="margin-top:20px;">
          <p style="margin:0 0 4px;font-size:13px;color:#666;text-transform:uppercase;letter-spacing:.05em;">
            ${label(biz.category)} · ${biz.city}, FL ${biz.zip}
          </p>
          <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#111;">${biz.name}</h1>
          ${biz.profile_summary ? `<p style="margin:0 0 16px;color:#444;font-size:16px;">${biz.profile_summary}</p>` : ''}
        </div>

        ${cta}

        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:20px;">
          ${biz.phone    ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> <a href="tel:${biz.phone}" style="color:#16a34a;">${biz.phone}</a></p>` : ''}
          ${biz.address  ? `<p style="margin:0 0 8px;"><strong>Address:</strong> ${biz.address}, ${biz.city}, FL ${biz.zip}</p>` : ''}
          ${site  ? `<p style="margin:0 0 8px;"><strong>Website:</strong> <a href="${site}" target="_blank" rel="noopener noreferrer" style="color:#16a34a;">${site}</a></p>` : ''}
          ${biz.service_area && biz.service_area.length > 1
            ? `<p style="margin:0;"><strong>Service area:</strong> ${biz.service_area.join(', ')}</p>` : ''}
        </div>

        ${biz.specialties && biz.specialties.length ? `
        <div style="margin-bottom:20px;">
          <p style="margin:0 0 8px;font-size:13px;color:#666;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Specialties</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${biz.specialties.map(s => `<span style="background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:20px;padding:4px 12px;font-size:13px;">${s}</span>`).join('')}
          </div>
        </div>` : ''}

        <div style="border-top:1px solid #f0fdf4;padding-top:16px;margin-top:8px;font-size:13px;color:#666;">
          <strong style="color:#16a34a;">LocalIntel Verified</strong> ·
          This business is discoverable by AI agents, voice assistants, and search engines through LocalIntel.
          <a href="${ownerLoginHref(biz)}" style="color:#16a34a;margin-left:4px;">Is this your business?</a>
        </div>
      </div>
      <footer>
        <div id="li-sponsors" class="li-sponsors">
          <p class="li-sponsors-label">Sponsored by</p>
          <div class="li-sponsors-row">
            <a class="li-sponsors-link" data-brand="poolpilot" href="https://poolpilot.xyz" target="_blank" rel="noopener noreferrer" aria-label="Sponsored by Pool Pilot — opens poolpilot.xyz">
              <img src="/images/poolpilot-logo.png" alt="Pool Pilot" width="48" height="48">
              <span class="li-sponsors-brand">poolpilot.xyz</span>
            </a>
            <a class="li-sponsors-link" data-brand="passithere" href="https://passithere.com/landing" target="_blank" rel="noopener noreferrer" aria-label="Sponsored by PassItHere — opens passithere.com/landing">
              <img src="/images/passithere-logo.png" alt="PassItHere" width="180" height="36">
              <span class="li-sponsors-brand">Passithere.com</span>
            </a>
          </div>
        </div>
      </footer>
    `;
    loadSponsors();
  }

  if (cfg.business_id) {
    render(cfg);
    fetch(`${RAILWAY}/api/local-intel/business/${cfg.business_id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data || !data.name) return;
        const merged = Object.assign({}, cfg, data);
        if (publicWebsite(cfg) && !publicWebsite(data)) merged.website = cfg.website;
        render(merged);
      })
      .catch(() => {});
  } else {
    document.body.innerHTML = '<p style="font-family:sans-serif;padding:40px;">Business not found.</p>';
  }
})();
