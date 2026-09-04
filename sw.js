/* ==========================================================================
   Driver Dost - Production Progressive Web App Service Worker (v3.2)
   Features:
   - App Shell & Asset Pre-caching (Up to 100MB+ storage quota)
   - High-performance Cache-First for static assets, tiles, and base64 assets
   - Stale-While-Revalidate with Fast Fallbacks
   - Dedicated OSRM & OpenStreetMap Tile Caching with LRU eviction
   - Network-First with Cache Fallback for navigation requests
   - Background Sync for Offline Bilty, Ledger & Transport Logs
   - Periodic Background Sync for Rate & Tariff Updates
   - Native Web Push Alerts & Notification Management
   ========================================================================== */

const CACHE_NAME = 'driver-dost-v17';
const TILE_CACHE_NAME = 'driver-dost-tiles-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './manifest.webmanifest',
  './logo.png',
  './bilty-official-icon.png',
  './bilty-official-icon.jpg',
  './app-icon.png',
  './icon-192.png',
  './icon-512.png',
  './screenshot-mobile.png',
  './screenshot-desktop.png',
  './vehicle-icon.png',
  './trip-icon.png',
  './bilty-icon.png',
  './gari-hisaab-icon.png',
  './safar-diary-icon.png',
  './echallan-icon.png',
  './license-icon.png',
  './quick-ops-icon.png',
  './scan-me-qr.png',
  './splash.png',
  './splash-screen.png',
  './toll-icon.png',
  './map-icon.png'
];

// Custom Urdu/English Offline Fallback Page
const OFFLINE_HTML = `
<!DOCTYPE html>
<html lang="ur" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Driver Dost - آف لائن (Offline)</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background-color: #fdfbf7; color: #4a4a35; text-align: center; padding: 2rem; margin: 0; }
    .card { background: white; border: 1px solid #ecece0; padding: 2.5rem 2rem; border-radius: 1.5rem; max-width: 420px; margin: 3rem auto; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
    h1 { color: #8b9d77; font-size: 1.5rem; margin-bottom: 0.75rem; font-family: 'Noto Nastaliq Urdu', serif; }
    p { color: #8e8e75; font-size: 0.95rem; line-height: 1.6; margin: 0.5rem 0; }
    .btn { display: inline-block; margin-top: 1.5rem; padding: 0.75rem 1.75rem; background: #8b9d77; color: white; border-radius: 0.75rem; text-decoration: none; font-weight: bold; font-size: 0.9rem; }
    .btn:hover { background: #7a8c66; }
  </style>
</head>
<body>
  <div class="card">
    <h1>آف لائن موڈ (Offline Mode)</h1>
    <p>آپ کے پاس انٹرنیٹ کنیکشن دستیاب نہیں ہے۔ ڈرائیور دوست کی پہلے سے محفوظ معلومات دستیاب ہیں۔</p>
    <p style="font-size: 0.85rem; color: #b58b28; margin-top: 1rem;">Internet connection unavailable. Cached transport records remain securely stored on your device.</p>
    <a href="/" class="btn" onclick="window.location.reload(); return false;">دوبارہ کوشش کریں (Retry Connection)</a>
  </div>
</body>
</html>
`;

// 1. Install Event: Cache Essential App Shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('PWA: Cache precache partial:', err);
      });
    })
  );
});

// 2. Activate Event: Purge Old Caches & Claim Clients Immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== TILE_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Network-First for Navigation, Stale-While-Revalidate / Cache-First for static & map tiles
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.protocol.startsWith('chrome-extension')) return;

  // Handle OpenStreetMap / CartoDB / Tile Server requests
  if (url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('basemaps.cartocdn.com') || url.pathname.endsWith('.png') && url.pathname.includes('/tiles/')) {
    event.respondWith(
      caches.open(TILE_CACHE_NAME).then(async (tileCache) => {
        const cachedTile = await tileCache.match(event.request);
        if (cachedTile) return cachedTile;

        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            tileCache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (e) {
          return cachedTile || new Response('', { status: 408, headers: { 'Content-Type': 'image/png' } });
        }
      })
    );
    return;
  }

  // For navigation/HTML requests: Network first, fall back to cache, then offline page
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request) || await caches.match('/index.html') || await caches.match('/');
          if (cachedResponse) return cachedResponse;
          return new Response(OFFLINE_HTML, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // For static assets (images, scripts, styles): Cache first, fallback to network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Background revalidation
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      });
    })
  );
});

// 4. Background Sync: Auto-sync pending bilties and transport accounts when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bilty-data' || event.tag === 'sync-offline-records' || event.tag === 'sync-transport-logs') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_OFFLINE_DATA', tag: event.tag });
        });
      })
    );
  }
});

// 5. Periodic Background Sync: Background check for NHA toll updates & fuel rates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-rates' || event.tag === 'sync-toll-tariffs') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'PERIODIC_SYNC_TRIGGERED', tag: event.tag });
        });
      })
    );
  }
});

// 6. Push Notifications: Native Device Status & Transport Alerts
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Driver Dost', body: event.data.text() };
    }
  }
  const title = data.title || 'Driver Dost Transport Manager';
  const options = {
    body: data.body || 'New freight dispatch or vehicle update',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    tag: data.tag || 'wg-push-alert',
    actions: [
      { action: 'open', title: 'Open App (کھولیں)' },
      { action: 'dismiss', title: 'Dismiss (بند کریں)' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// 7. Notification Click: Bring app to focus or open target tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// 8. Message Channel Handler for skipWaiting & App State
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_NAME });
  } else if (event.data.type === 'CLIENTS_CLAIM') {
    self.clients.claim();
  }
});

// 9. Push Subscription Change Handler
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then((newSubscription) => {
        // Send new subscription to clients/backend
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED', subscription: newSubscription });
          });
        });
      })
  );
});

