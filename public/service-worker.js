const CACHE_NAME = 'natillera-v4';
const APP_SHELL = [
  '/',
  '/index.html',
  '/login.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/css/index.css',
  '/css/login.css',
  '/css/dashboard.css',
  '/js/index.js',
  '/js/login.js',
  '/js/dashboard.js',
  '/js/usuarios.js',
  '/js/configuracion.js',
  '/js/pwa.js',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const request = event.request;
  const acceptHeader = request.headers.get('accept') || '';
  const isDocument = request.mode === 'navigate' || acceptHeader.includes('text/html');
  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  if (isDocument) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          return cachedResponse || caches.match('/offline.html');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        return response;
      });
    })
  );
});
