const CACHE_NAME = 'ollama-cache-v1';
const OFFLINE_URLS = ['/', '/chat', '/models', '/settings'];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (
          event.request.method === 'GET' &&
          response.status === 200 &&
          !event.request.url.startsWith('chrome-extension')
        ) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
