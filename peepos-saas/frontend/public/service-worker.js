// A more robust service worker for offline functionality.

const CACHE_NAME = 'sge-peru-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  // The app shell is cached on install.
  // Other assets (JS, CSS, images) will be cached dynamically on first request.
];

// --- INSTALL: Cache the application shell ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
});

// --- ACTIVATE: Clean up old caches ---
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  // Take control of all open clients immediately
  return self.clients.claim();
});

// --- FETCH: Implement a "Cache falling back to network" strategy with dynamic caching ---
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For requests to external CDNs, let the browser handle caching as per its policies.
  // This avoids potential CORS issues or caching opaque responses.
  if (event.request.url.startsWith('https://aistudiocdn.com') || 
      event.request.url.startsWith('https://cdn.tailwindcss.com') ||
      event.request.url.startsWith('https://fonts.googleapis.com') ||
      event.request.url.startsWith('https://fonts.gstatic.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. If we find a match in the cache, return it.
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. If not in cache, fetch from the network.
      return fetch(event.request).then((networkResponse) => {
        // We need to clone the response because it's a one-time-use stream.
        const responseToCache = networkResponse.clone();

        // 3. Open our cache and add the new response for future requests.
        caches.open(CACHE_NAME).then((cache) => {
          // Only cache successful responses
          if (responseToCache.status < 400) {
            cache.put(event.request, responseToCache);
          }
        });

        // 4. Return the network response to the browser.
        return networkResponse;
      }).catch(error => {
        console.error('Service Worker: Fetch failed; user is offline or network error.', error);
        // Here you could return a fallback offline page if you had one cached.
        // For example: return caches.match('/offline.html');
      });
    })
  );
});
