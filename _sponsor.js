/**
 * _sponsor.js — Pool Pilot sponsor bar for every LocalIntel page
 * Injects a linked "Sponsored by poolpilot.xyz" lockup at the bottom of
 * the document. Re-attaches after engines replace document.body.innerHTML.
 */
(function () {
  'use strict';

  var ID = 'poolpilot-sponsor';
  var STYLE_ID = 'poolpilot-sponsor-style';
  var HREF = 'https://poolpilot.xyz';
  var LOGO = '/images/poolpilot-logo.png';

  function addStyles() {
    if (document.getElementById(STYLE_ID) || !document.head) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.poolpilot-sponsor{',
      'display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;',
      'padding:18px 20px;background:#071627;color:#fff;text-decoration:none;',
      'border-top:1px solid rgba(255,255,255,.08);font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;',
      'transition:background .18s ease;',
      '}',
      '.poolpilot-sponsor:hover,.poolpilot-sponsor:focus-visible{',
      'background:#0b2438;outline:none;',
      '}',
      '.poolpilot-sponsor-label{',
      'font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94A3B8;',
      '}',
      '.poolpilot-sponsor img{',
      'width:52px;height:52px;object-fit:contain;display:block;flex-shrink:0;',
      '}',
      '.poolpilot-sponsor-brand{',
      'font-size:16px;font-weight:700;letter-spacing:.01em;color:#7EB6E8;',
      '}',
      '.poolpilot-sponsor:hover .poolpilot-sponsor-brand,.poolpilot-sponsor:focus-visible .poolpilot-sponsor-brand{',
      'color:#fff;text-decoration:underline;text-underline-offset:3px;',
      '}'
    ].join('');
    document.head.appendChild(style);
  }

  function markup() {
    return (
      '<span class="poolpilot-sponsor-label">Sponsored by</span>' +
      '<img src="' + LOGO + '" alt="Pool Pilot" width="52" height="52">' +
      '<span class="poolpilot-sponsor-brand">poolpilot.xyz</span>'
    );
  }

  function inject() {
    if (!document.body) return;
    addStyles();
    var existing = document.getElementById(ID);
    if (existing) {
      if (existing.tagName !== 'A' || existing.getAttribute('href') !== HREF) {
        existing.setAttribute('href', HREF);
      }
      return;
    }
    var a = document.createElement('a');
    a.id = ID;
    a.className = 'poolpilot-sponsor';
    a.href = HREF;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', 'Sponsored by Pool Pilot — opens poolpilot.xyz');
    a.innerHTML = markup();
    document.body.appendChild(a);
  }

  function start() {
    inject();
    if (window._poolpilotSponsorObs || !document.body) return;
    window._poolpilotSponsorObs = new MutationObserver(function () {
      if (!document.getElementById(ID)) inject();
    });
    window._poolpilotSponsorObs.observe(document.body, { childList: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
