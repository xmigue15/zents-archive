/* ============================================================
   Zent — service worker
   Guarda el shell de la app para que funcione sin conexión.
   ============================================================ */

const CACHE_NAME = 'zent-v11';
const APP_SHELL = [
  './',
  './index.html',
  './login.html',
  './styles.css',
  './app.js',
  './supabase-config.js',
  './sync.js',
  './manifest.webmanifest',
  './icons/zent.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Supabase y el CDN van siempre a la red.
  if (url.origin !== self.location.origin) return;

  const isDocument = request.mode === 'navigate' ||
    request.destination === 'document';
  const isCode = request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'worker' ||
    url.pathname.endsWith('.webmanifest');

  // Navegación y código: red primero para recibir las actualizaciones al instante.
  if (isDocument || isCode) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => {
          if (cached) return cached;
          if (isDocument) {
            const fallback = url.pathname.endsWith('login.html') ? './login.html' : './index.html';
            return caches.match(fallback);
          }
          return undefined;
        }))
    );
    return;
  }

  // Imágenes e iconos: caché primero, actualizando en segundo plano.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
