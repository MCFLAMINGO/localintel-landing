/**
 * _biz-page.js — LocalIntel Business Page Client Renderer
 * Shared by all /biz/{slug}.html pages. window.BIZ_CONFIG is injected per page.
 */
(function () {
  'use strict';

  const cfg     = window.BIZ_CONFIG || {};
  const SITE    = 'https://www.thelocalintel.com';
  const RAILWAY = 'https://gsb-swarm-production.up.railway.app';

  // ── Render ─────────────────────────────────────────────────────────────────
  function render(biz) {
    document.title = `${biz.name} — ${label(biz.category)} in ${biz.city} | LocalIntel`;

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

        <!-- CTA -->
        <a href="${biz.order_url}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none;margin-bottom:24px;">
          Request a Quote / Place an Order →
        </a>

        <!-- Details -->
        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:20px;">
          ${biz.phone    ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> <a href="tel:${biz.phone}" style="color:#16a34a;">${biz.phone}</a></p>` : ''}
          ${biz.address  ? `<p style="margin:0 0 8px;"><strong>Address:</strong> ${biz.address}, ${biz.city}, FL ${biz.zip}</p>` : ''}
          ${biz.website  ? `<p style="margin:0 0 8px;"><strong>Website:</strong> <a href="${biz.website}" target="_blank" rel="noopener" style="color:#16a34a;">${biz.website}</a></p>` : ''}
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

        <!-- LocalIntel badge -->
        <div style="border-top:1px solid #f0fdf4;padding-top:16px;margin-top:8px;font-size:13px;color:#666;">
          <strong style="color:#16a34a;">LocalIntel Verified</strong> ·
          This business is discoverable by AI agents, voice assistants, and search engines through LocalIntel.
          <a href="${SITE}/claim" style="color:#16a34a;margin-left:4px;">Is this your business?</a>
        </div>
      </div>
    `;
  }

  function label(cat) {
    return (cat || 'Local Business').replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // ── Boot ───────────────────────────────────────────────────────────────────
  if (cfg.business_id) {
    // Render immediately from injected config (no fetch needed)
    render(cfg);

    // Optionally refresh live data in background (non-blocking)
    fetch(`${RAILWAY}/api/local-intel/business/${cfg.business_id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && data.name) render(Object.assign({}, cfg, data)); })
      .catch(() => {}); // silent — static render is good enough
  } else {
    document.body.innerHTML = '<p style="font-family:sans-serif;padding:40px;">Business not found.</p>';
  }
})();
