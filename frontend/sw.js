const CACHE_NAME = 'votewise-cache-v1';
const urlsToCache = [
  '/',
  '/static/styles/premium.css',
  '/static/styles/votewise_v2.css',
  '/static/js/votewise_core.js',
  '/static/logo_votewise_ai.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request);
      })
  );
});
