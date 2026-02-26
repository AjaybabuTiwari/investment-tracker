// ── Investment Tracker Service Worker ─────────────────
const CACHE_NAME = 'inv-tracker-v2';
const BASE = 'https://ajaybabutiwari.github.io/investment-tracker/';

const PRECACHE = [
  BASE,
  BASE + 'manifest.json',
];

// INSTALL — cache shell files
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// ACTIVATE — remove old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// FETCH — serve from cache, fall back to network
self.addEventListener('fetch', function(e) {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(function() {
        return caches.match(BASE);
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request);
    })
  );
});

// PUSH NOTIFICATIONS
self.addEventListener('push', function(e) {
  var data = e.data ? e.data.json() : {};
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

// NOTIFICATION CLICK — open app
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(clients.openWindow(BASE));
});

// BACKGROUND SYNC
self.addEventListener('sync', function(e) {
  if (e.tag === 'sync-investments') {
    console.log('Background sync: investments');
  }
});
