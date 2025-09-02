const CACHE_NAME = 'dreampixel-cache-v3'; // Bump version for update
const urlsToCache = [
  '/',
  '/index.html',
  // Note: In a real build system, a manifest of hashed assets (JS, CSS) would be injected here.
  // For this environment, we cache the core entry points.
];

// Install the service worker and cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate the service worker and clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Implement fetch handling with SPA fallback for 404s
self.addEventListener('fetch', (event) => {
  // We only handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests (e.g., loading a page), use a network-first strategy
  // that falls back to the main app shell (`/index.html`) on failure or 404.
  // This is the standard pattern for Single Page Applications (SPAs).
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(event.request);
          // A 2xx response is a success. A 404 for navigation is a failure.
          if (networkResponse.ok) {
            return networkResponse;
          }

          // Non-ok response (e.g., 404), serve the app shell.
          console.log(`[SW] Serving app shell for failed navigation: ${event.request.url}`);
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match('/index.html');
          return cachedResponse;

        } catch (error) {
          // Network error (offline), serve the app shell from cache.
          console.log(`[SW] Network error during navigation, serving app shell from cache for: ${event.request.url}`);
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match('/index.html');
          return cachedResponse;
        }
      })()
    );
    return;
  }

  // For all other requests (assets like JS, CSS, images), use the
  // "stale-while-revalidate" strategy for speed and offline capability.
  // We exclude cross-origin requests from caching.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});
