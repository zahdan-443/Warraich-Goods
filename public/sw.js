/* ==========================================================================
   Warraich Goods - Production Progressive Web App Service Worker (v3.0)
   Features:
   - App Shell Caching & Version Cleanup
   - Network-First with Cache Fallback & Custom Offline Page
   - Background Sync for Offline Bilty & Transport Logs
   - Periodic Background Sync for Rate & Tariff Updates
   - Native Web Push Alerts & Notification Management
   - Bi-Directional Message Channel & Skip Waiting Support
   ========================================================================== */

const CACHE_NAME = 'warraich-goods-v9';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/logo.png',
  '/app-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/screenshot-mobile.png',
  '/screenshot-desktop.png',
  '/vehicle-icon.png',
  '/trip-icon.png',
  '/bilty-icon.png',
  '/gari-hisaab-icon.png',
  '/safar-diary-icon.png',
  '/echallan-icon.png',
  '/license-icon.png',
  '/quick-ops-icon.png',
  '/scan-me-qr.png',
  '/splash.png',
  '/splash-screen.png',
  '/toll-icon.png'
];

// Custom Urdu/English Offline Fallback Page
const OFFLINE_HTML = `
<!DOCTYPE html>
<html lang="ur" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Warraich Goods - آف لائن (Offline)</title>
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
    <p>آپ کے پاس انٹرنیٹ کنیکشن دستیاب نہیں ہے۔ وڑائچ گڈز کی پہلے سے محفوظ معلومات دستیاب ہیں۔</p>
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
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Network-First with Cache Fallback for documents, Cache-First for static assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.protocol.startsWith('chrome-extension')) return;

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
        // Fetch in background to revalidate cache
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
      data = { title: 'Warraich Goods', body: event.data.text() };
    }
  }
  const title = data.title || 'Warraich Goods Transport Co.';
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

