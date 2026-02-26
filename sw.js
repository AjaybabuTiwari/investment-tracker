// Investment Tracker — Service Worker
const CACHE = 'inv-tracker-v1';
const APP_URL = 'https://script.google.com/macros/s/AKfycbwZZ0bSY3io2RQ1vU_y24EVsUB9A6fuOUIj2nyap-2Sy-fgR2BNgyZ6jKcwe7biCBmR/exec';

// ── INSTALL ──────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll([
        '/',
        '/manifest.json',
      ]);
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE ─────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── FETCH — serve shell from cache, app from network ─
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/'))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// ── PUSH NOTIFICATIONS ────────────────────────────────
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || '📈 Investment Tracker', {
      body: data.body || 'Check your investments',
      icon: 'https://img.icons8.com/color/192/000000/investment-portfolio.png',
      badge: 'https://img.icons8.com/color/96/000000/investment-portfolio.png',
      vibrate: [200, 100, 200],
      tag: 'inv-alert',
      requireInteraction: true
    })
  );
});

// ── NOTIFICATION CLICK ────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('inv') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

// ── BACKGROUND SYNC ───────────────────────────────────
self.addEventListener('sync', e => {
  if (e.tag === 'sync-investments') {
    console.log('Background sync triggered');
  }
});
