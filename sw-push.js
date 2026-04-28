/**
 * sw-push.js — LocalIntel Push Service Worker
 * Handles incoming Web Push notifications and action buttons.
 * Registered from inbox.html and claim.html.
 */

const CACHE_NAME = 'localintel-push-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// ── Incoming push ─────────────────────────────────────────────────────────────
self.addEventListener('push', function(event) {
  if (!event.data) return;

  let data;
  try { data = event.data.json(); }
  catch(e) { data = { title: 'LocalIntel', body: event.data.text() }; }

  const title   = data.title   || 'New Job on LocalIntel';
  const options = {
    body:    data.body    || 'A new job request is waiting for you.',
    icon:    '/icon-192.png',
    badge:   '/badge-96.png',
    tag:     data.rfq_id  || 'localintel-job',
    renotify: true,
    requireInteraction: data.job_type === 'delivery', // delivery stays until tapped
    data: {
      rfq_id:       data.rfq_id       || null,
      map_url:      data.map_url       || null,
      accept_url:   data.accept_url    || null,
      inbox_url:    data.inbox_url     || 'https://www.thelocalintel.com/inbox',
      job_type:     data.job_type      || 'proposal',
    },
    actions: [],
  };

  // Delivery: show Accept + Map actions
  if (data.job_type === 'delivery') {
    options.actions = [
      { action: 'accept', title: '✅ Accept' },
      { action: 'map',    title: '🗺 Open Maps' },
    ];
  } else {
    // Proposal: show View action
    options.actions = [
      { action: 'view', title: '👀 View Job' },
    ];
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click / action ───────────────────────────────────────────────
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const d = event.notification.data || {};

  let targetUrl = d.inbox_url || 'https://www.thelocalintel.com/inbox';

  if (event.action === 'accept' && d.accept_url) {
    // POST accept in background, then open inbox
    event.waitUntil(
      fetch(d.accept_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfq_id: d.rfq_id }),
      })
      .then(() => self.clients.openWindow(targetUrl + '?rfq=' + (d.rfq_id || '')))
      .catch(() => self.clients.openWindow(targetUrl))
    );
    return;
  }

  if (event.action === 'map' && d.map_url) {
    event.waitUntil(self.clients.openWindow(d.map_url));
    return;
  }

  // Default: open inbox focused on this RFQ
  if (d.rfq_id) targetUrl += '?rfq=' + d.rfq_id;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        const existing = clients.find(c => c.url.includes('thelocalintel.com'));
        if (existing) { existing.focus(); existing.navigate(targetUrl); }
        else self.clients.openWindow(targetUrl);
      })
  );
});
