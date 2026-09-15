/**
 * _sponsors.js — LocalIntel sponsor strip (Pool Pilot + PassItHere)
 * Injects at the bottom of every page. Re-attaches after engines replace
 * document.body.innerHTML.
 */
(function () {
  'use strict';

  var ID = 'li-sponsors';
  var STYLE_ID = 'li-sponsors-style';
  var SPONSORS = [
    {
      href: 'https://poolpilot.xyz',
      logo: '/images/poolpilot-logo.png',
      alt: 'Pool Pilot',
      brand: 'poolpilot.xyz',
      width: 48,
      height: 48,
      aria: 'Sponsored by Pool Pilot — opens poolpilot.xyz'
    },
    {
      href: 'https://passithere.com/landing',
      logo: '/images/passithere-logo.png',
      alt: 'PassItHere',
      brand: 'Passithere.com',
      width: 180,
      height: 36,
      aria: 'Sponsored by PassItHere — opens passithere.com/landing'
    }
  ];

  function addStyles() {
    if (document.getElementById(STYLE_ID) || !document.head) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.li-sponsors{',
      'display:flex;align-items:center;justify-content:center;gap:18px 28px;flex-wrap:wrap;',
      'padding:18px 20px;background:#071627;color:#fff;',
      'border-top:1px solid rgba(255,255,255,.08);font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;',
      '}',
      '.li-sponsors-label{',
      'font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94A3B8;',
      'width:100%;text-align:center;margin:0;',
      '}',
      '.li-sponsors-row{',
      'display:flex;align-items:center;justify-content:center;gap:28px;flex-wrap:wrap;',
      '}',
      '.li-sponsors-link{',
      'display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff;',
      'padding:6px 8px;border-radius:10px;transition:background .18s ease;',
      '}',
      '.li-sponsors-link:hover,.li-sponsors-link:focus-visible{',
      'background:rgba(255,255,255,.06);outline:none;',
      '}',
      '.li-sponsors-link img{',
      'object-fit:contain;display:block;flex-shrink:0;',
      '}',
      '.li-sponsors-link[data-brand="poolpilot"] img{width:48px;height:48px;}',
      '.li-sponsors-link[data-brand="passithere"] img{height:36px;width:auto;max-width:200px;}',
      '.li-sponsors-brand{',
      'font-size:15px;font-weight:700;letter-spacing:.01em;',
      '}',
      '.li-sponsors-link[data-brand="poolpilot"] .li-sponsors-brand{color:#7EB6E8;}',
      '.li-sponsors-link[data-brand="passithere"] .li-sponsors-brand{color:#F87171;}',
      '.li-sponsors-link:hover .li-sponsors-brand,.li-sponsors-link:focus-visible .li-sponsors-brand{',
      'color:#fff;text-decoration:underline;text-underline-offset:3px;',
      '}'
    ].join('');
    document.head.appendChild(style);
  }

  function linkMarkup(s, brand) {
    return (
      '<a class="li-sponsors-link" data-brand="' + brand + '" href="' + s.href +
      '" target="_blank" rel="noopener noreferrer" aria-label="' + s.aria + '">' +
      '<img src="' + s.logo + '" alt="' + s.alt + '" width="' + s.width + '" height="' + s.height + '">' +
      '<span class="li-sponsors-brand">' + s.brand + '</span>' +
      '</a>'
    );
  }

  function markup() {
    return (
      '<p class="li-sponsors-label">Sponsored by</p>' +
      '<div class="li-sponsors-row">' +
      linkMarkup(SPONSORS[0], 'poolpilot') +
      linkMarkup(SPONSORS[1], 'passithere') +
      '</div>'
    );
  }

  function inject() {
    if (!document.body) return;
    addStyles();
    var existing = document.getElementById(ID);
    if (existing) {
      if (!existing.querySelector('[data-brand="poolpilot"]') ||
          !existing.querySelector('[data-brand="passithere"]')) {
        existing.innerHTML = markup();
      }
      return;
    }
    var wrap = document.createElement('div');
    wrap.id = ID;
    wrap.className = 'li-sponsors';
    wrap.setAttribute('role', 'contentinfo');
    wrap.innerHTML = markup();
    document.body.appendChild(wrap);
  }

  window.__liSponsorsInject = inject;

  function start() {
    inject();
    if (window._liSponsorsObs || !document.body) return;
    window._liSponsorsObs = new MutationObserver(function () {
      if (!document.getElementById(ID)) inject();
    });
    window._liSponsorsObs.observe(document.body, { childList: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
