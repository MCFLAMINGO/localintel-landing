/**
 * _sponsors.js — PassItHere sponsor bar for every LocalIntel page
 * Injects a linked "Sponsored by Passithere.com" lockup at the bottom.
 * Re-attaches after engines replace document.body.innerHTML.
 */
(function () {
  'use strict';

  var ID = 'passithere-sponsor';
  var STYLE_ID = 'passithere-sponsor-style';
  var HREF = 'https://passithere.com/landing';
  var LOGO = '/images/passithere-logo.png';

  function addStyles() {
    if (document.getElementById(STYLE_ID) || !document.head) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.passithere-sponsor{',
      'display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;',
      'padding:18px 20px;background:#0a0a0f;color:#fff;text-decoration:none;',
      'border-top:1px solid rgba(255,255,255,.08);font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;',
      'transition:background .18s ease;',
      '}',
      '.passithere-sponsor:hover,.passithere-sponsor:focus-visible{',
      'background:#14141c;outline:none;',
      '}',
      '.passithere-sponsor-label{',
      'font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94A3B8;',
      '}',
      '.passithere-sponsor img{',
      'height:36px;width:auto;max-width:220px;object-fit:contain;display:block;flex-shrink:0;',
      '}',
      '.passithere-sponsor-brand{',
      'font-size:16px;font-weight:700;letter-spacing:.01em;color:#F87171;',
      '}',
      '.passithere-sponsor:hover .passithere-sponsor-brand,.passithere-sponsor:focus-visible .passithere-sponsor-brand{',
      'color:#fff;text-decoration:underline;text-underline-offset:3px;',
      '}'
    ].join('');
    document.head.appendChild(style);
  }

  function markup() {
    return (
      '<span class="passithere-sponsor-label">Sponsored by</span>' +
      '<img src="' + LOGO + '" alt="PassItHere" width="180" height="36">' +
      '<span class="passithere-sponsor-brand">Passithere.com</span>'
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
      existing.setAttribute('target', '_blank');
      existing.setAttribute('rel', 'noopener noreferrer');
      return;
    }
    var a = document.createElement('a');
    a.id = ID;
    a.className = 'passithere-sponsor';
    a.href = HREF;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', 'Sponsored by PassItHere — opens passithere.com/landing');
    a.innerHTML = markup();
    document.body.appendChild(a);
  }

  window.__liSponsorsInject = inject;

  function start() {
    inject();
    if (window._passithereSponsorObs || !document.body) return;
    window._passithereSponsorObs = new MutationObserver(function () {
      if (!document.getElementById(ID)) inject();
    });
    window._passithereSponsorObs.observe(document.body, { childList: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
