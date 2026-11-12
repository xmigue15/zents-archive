/* ============================================================
   Zent â€” service worker
   Guarda el shell de la app para que funcione sin conexiÃ³n.
   ============================================================ */

const CACHE_NAME = 'zent-v47';
const APP_SHELL = [
  './',
  './index.html',
  './login.html',
  './styles.css',
  './theme-nayda.css',
  './fonts.css',
  './iconos.css',
  './icons/iconos.js',
  './fonts/inter-normal.woff2',
  './fonts/redaction10-regular.woff2',
  './fonts/redaction10-bold.woff2',
  './fonts/redaction10-italic.woff2',
  './app.js',
  './supabase-config.js',
  './sync.js',
  './manifest.webmanifest',
  './icons/zent.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './logos/nequi.png',
  './logos/daviplata.png',
  './logos/bancolombia.png',
  './logos/bogota.png',
  './logos/bbva.png',
  './logos/davivienda.png',
  './logos/itau.png',
  './logos/movii.png',
  './logos/rappipay.png',
  './logos/nu.png',
  './logos/daviplata-blanco.png',
  './logos/bbva-blanco.png',
  './logos/itau-marca.png',
  './logos/movii-marca.png',
  './logos/rappipay-marca.png',
  './logos/bogota-marca.png',
  './logos/nu-marca.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL.map((url) => new Request(url, { cache: 'reload' }))))
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

  // NavegaciÃ³n y cÃ³digo: red primero para recibir las actualizaciones al instante.
  if (isDocument || isCode) {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
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

  // ImÃ¡genes e iconos: cachÃ© primero, actualizando en segundo plano.
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
