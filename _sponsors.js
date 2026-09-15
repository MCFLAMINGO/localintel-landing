/**
 * _sponsors.js — LocalIntel footer sponsor strip (Pool Pilot + PassItHere)
 * Mounts inside <footer> on every page. Creates a footer when the page has none.
 * Re-attaches after engines replace document.body.innerHTML.
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
      'footer{width:100%;margin-top:auto;box-sizing:border-box;align-self:stretch;}',
      'footer[data-li-sponsors-footer="1"]{',
      'display:block;padding:0;background:#fff;flex-shrink:0;',
      '}',
      '.li-sponsors{',
      'display:flex;align-items:center;justify-content:center;gap:14px 28px;flex-wrap:wrap;',
      'padding:16px 20px 20px;background:#F8FAFC;color:#111827;',
      'border-top:1px solid #E5E7EB;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;',
      'box-sizing:border-box;width:100%;',
      '}',
      '.li-sponsors-label{',
      'font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748B;',
      'width:100%;text-align:center;margin:0;',
      '}',
      '.li-sponsors-row{',
      'display:flex;align-items:center;justify-content:center;gap:28px;flex-wrap:wrap;',
      '}',
      '.li-sponsors-link{',
      'display:flex;align-items:center;gap:10px;text-decoration:none;color:#111827;',
      'padding:8px 10px;border-radius:10px;transition:background .18s ease;',
      '}',
      '.li-sponsors-link:hover,.li-sponsors-link:focus-visible{',
      'background:rgba(15,23,42,.06);outline:none;',
      '}',
      '.li-sponsors-link img{',
      'object-fit:contain;display:block;flex-shrink:0;',
      '}',
      '.li-sponsors-link[data-brand="poolpilot"] img{width:48px;height:48px;}',
      '.li-sponsors-link[data-brand="passithere"] img{height:36px;width:auto;max-width:200px;}',
      '.li-sponsors-brand{',
      'font-size:15px;font-weight:700;letter-spacing:.01em;',
      '}',
      '.li-sponsors-link[data-brand="poolpilot"] .li-sponsors-brand{color:#0369A1;}',
      '.li-sponsors-link[data-brand="passithere"] .li-sponsors-brand{color:#DC2626;}',
      '.li-sponsors-link:hover .li-sponsors-brand,.li-sponsors-link:focus-visible .li-sponsors-brand{',
      'color:#111827;text-decoration:underline;text-underline-offset:3px;',
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

  function hasBothBrands(node) {
    return node.querySelector('[data-brand="poolpilot"]') &&
      node.querySelector('[data-brand="passithere"]');
  }

  function ensureFooter() {
    var real = document.querySelector('footer:not([data-li-sponsors-footer])');
    if (real) {
      var placeholder = document.querySelector('footer[data-li-sponsors-footer]');
      if (placeholder && placeholder !== real) placeholder.remove();
      return real;
    }
    var existing = document.querySelector('footer');
    if (existing) return existing;
    var footer = document.createElement('footer');
    footer.setAttribute('data-li-sponsors-footer', '1');
    document.body.appendChild(footer);
    return footer;
  }

  function fillStrip(wrap) {
    wrap.id = ID;
    wrap.className = 'li-sponsors';
    wrap.removeAttribute('role');
    wrap.innerHTML = markup();
  }

  function inject() {
    if (!document.body) return;
    addStyles();
    var footer = ensureFooter();
    var existing = document.getElementById(ID);
    if (!existing) {
      existing = document.createElement('div');
      fillStrip(existing);
    } else if (!hasBothBrands(existing)) {
      fillStrip(existing);
    }
    if (existing.parentNode !== footer) footer.appendChild(existing);
  }

  window.__liSponsorsInject = inject;

  function start() {
    inject();
    if (window._liSponsorsObs || !document.body) return;
    window._liSponsorsObs = new MutationObserver(function () {
      var node = document.getElementById(ID);
      var footer = document.querySelector('footer');
      if (!node || !footer || node.parentNode !== footer) inject();
    });
    window._liSponsorsObs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
