/* ==========================================================================
   Driver Dost - Production Progressive Web App Service Worker (v4.0)
   Features:
   - Complete Offline App Shell & Full Pre-caching (JS, CSS, HTML, Media)
   - Resilient Cache-First Architecture for Offline Instant Launch
   - Navigation Fallback directly to Cached SPA App Shell (No Blocking Error Screens)
   - Map Tile Caching (OSRM, OpenStreetMap, CartoDB) with Transparent Offline Tile Fallback
   - Dynamic Asset Discovery on Service Worker Install
   - Background Sync for Offline Bilty, Ledger & Transport Records
   - Web Push Alerts & Notification Management
   ========================================================================== */

const CACHE_NAME = 'driver-dost-v20';
const TILE_CACHE_NAME = 'driver-dost-tiles-v2';

// Core static assets always available locally
const CORE_STATIC_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'manifest.webmanifest',
  'logo.png',
  'bilty-official-icon.png',
  'bilty-official-icon.jpg',
  'app-icon.png',
  'icon-192.png',
  'icon-512.png',
  'screenshot-mobile.png',
  'screenshot-desktop.png',
  'vehicle-icon.png',
  'trip-icon.png',
  'bilty-icon.png',
  'gari-hisaab-icon.png',
  'safar-diary-icon.png',
  'echallan-icon.png',
  'license-icon.png',
  'quick-ops-icon.png',
  'scan-me-qr.png',
  'splash.png',
  'toll-icon.png',
  'map-icon.png',
  'company-card.png',
  'warraich-card.png'
];

// Production build chunks injected during build step (vite build -> sync-android-assets.js)
const BUILD_ASSETS = [
    './assets/index-CH5xEbvQ.js',
  './assets/index-CsGuk8BP.css',
  './assets/vendor-firebase-CyRSZaZw.js',
  './assets/vendor-pdf-DHk9U0YS.js',
  './assets/vendor-react-BsiFW0t0.js'
];

// 1. Install Event: Precache All Shell Assets + Parse HTML for Vite Bundles
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const allToCache = Array.from(new Set([...CORE_STATIC_ASSETS, ...BUILD_ASSETS]));

      // Pre-cache known static & build assets with fault tolerance
      await Promise.allSettled(
        allToCache.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (res && (res.status === 200 || res.type === 'opaque')) {
              await cache.put(url, res);
            }
          } catch (e) {
            // Silently continue on individual asset fetch failure
          }
        })
      );

      // Fetch and cache index.html under multiple canonical keys
      try {
        const indexRes = await fetch('./index.html', { cache: 'no-cache' });
        if (indexRes && indexRes.status === 200) {
          const htmlText = await indexRes.text();
          const scope = self.registration.scope;

          const aliases = ['./', 'index.html', './index.html', '/', scope, `${scope}index.html`];
          for (const alias of aliases) {
            await cache.put(
              alias,
              new Response(htmlText, {
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
              })
            );
          }

          // Dynamically detect script and stylesheet chunks referenced in index.html
          const assetRegex = /(?:src|href)=["'](\.?\/assets\/[^"']+)["']/g;
          let match;
          const dynamicAssets = [];
          while ((match = assetRegex.exec(htmlText)) !== null) {
            dynamicAssets.push(match[1]);
          }

          await Promise.allSettled(
            dynamicAssets.map(async (assetUrl) => {
              try {
                const assetRes = await fetch(assetUrl);
                if (assetRes && assetRes.status === 200) {
                  await cache.put(assetUrl, assetRes);
                }
              } catch (e) {
                // Ignore individual chunk failures
              }
            })
          );
        }
      } catch (err) {
        console.warn('PWA: Notice during index.html precache:', err);
      }
    })()
  );
});

// 2. Activate Event: Clean up outdated caches & claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== TILE_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

// 3. Fetch Event
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore browser extensions and localhost/dev internal endpoints
  if (url.protocol.startsWith('chrome-extension')) return;
  if (
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.includes('/node_modules/')
  ) {
    return;
  }

  // Handle OpenStreetMap / CartoDB / Tile Server requests
  if (
    url.hostname.includes('tile.openstreetmap.org') ||
    url.hostname.includes('basemaps.cartocdn.com') ||
    (url.pathname.endsWith('.png') && url.pathname.includes('/tiles/'))
  ) {
    event.respondWith(
      (async () => {
        const tileCache = await caches.open(TILE_CACHE_NAME);
        const cached = await tileCache.match(event.request);
        if (cached) return cached;

        try {
          const res = await fetch(event.request);
          if (res && res.status === 200) {
            tileCache.put(event.request, res.clone());
          }
          return res;
        } catch (e) {
          // Return a valid transparent 1x1 PNG response when offline so map doesn't show broken icons
          return new Response(
            Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='), (c) => c.charCodeAt(0)),
            { headers: { 'Content-Type': 'image/png' } }
          );
        }
      })()
    );
    return;
  }

  // Handle SPA Navigation requests (HTML)
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      (async () => {
        // Attempt network first with snappy 2-second timeout
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          const networkResponse = await fetch(event.request, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
            cache.put('index.html', networkResponse.clone());
            cache.put('./', networkResponse.clone());
            return networkResponse;
          }
        } catch (e) {
          // Network failed or offline - fall through immediately to cached app shell
        }

        // Return cached app shell with ignoreSearch: true for query parameters (?utm_source, etc.)
        const cached =
          (await caches.match(event.request, { ignoreSearch: true })) ||
          (await caches.match('./', { ignoreSearch: true })) ||
          (await caches.match('index.html', { ignoreSearch: true })) ||
          (await caches.match('./index.html', { ignoreSearch: true })) ||
          (await caches.match('/', { ignoreSearch: true })) ||
          (await caches.match(self.registration.scope, { ignoreSearch: true }));

        if (cached) return cached;

        // Fallback: search cache keys for any valid index.html or root
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        for (const k of keys) {
          if (k.url.endsWith('index.html') || k.url.endsWith('/')) {
            const match = await cache.match(k);
            if (match) return match;
          }
        }

        // Ultimate fallback response
        return new Response(
          '<!DOCTYPE html><html lang="ur"><head><meta charset="utf-8"><title>Driver Dost</title></head><body style="font-family:sans-serif;text-align:center;padding:2rem;"><h2>ڈرائیور دوست</h2><p>ایپ کو پہلی بار لوڈ ہونے دیں تاکہ یہ آف لائن محفوظ ہو سکے۔</p></body></html>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      })()
    );
    return;
  }

  // Handle Static Assets (JS, CSS, Fonts, Images) - Cache First with Network Fallback
  event.respondWith(
    (async () => {
      // 1. Check cache first
      const cached = await caches.match(event.request, { ignoreSearch: true });
      if (cached) {
        // Revalidate in background when online
        if (navigator.onLine) {
          fetch(event.request)
            .then(async (res) => {
              if (res && (res.status === 200 || res.type === 'opaque')) {
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, res);
              }
            })
            .catch(() => {});
        }
        return cached;
      }

      // 2. Fetch from network
      try {
        const res = await fetch(event.request);
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, res.clone());
        }
        return res;
      } catch (err) {
        // 3. Fallback matching by filename (useful for relative path variations)
        const pathname = url.pathname;
        const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
        if (filename) {
          const altMatch =
            (await caches.match(filename, { ignoreSearch: true })) ||
            (await caches.match(`./${filename}`, { ignoreSearch: true }));
          if (altMatch) return altMatch;
        }

        // If an image request fails offline, fallback to cached logo.png
        if (event.request.destination === 'image' || pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|ico)$/i)) {
          const logoFallback = (await caches.match('logo.png')) || (await caches.match('./logo.png'));
          if (logoFallback) return logoFallback;
        }

        throw err;
      }
    })()
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

// 5. Periodic Background Sync: Periodic rate and tariff updates
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
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED', subscription: newSubscription });
          });
        });
      })
  );
});
