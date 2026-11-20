/* ============================================================
   Zent — service worker
   Guarda el shell de la app para que funcione sin conexión y
   abra al instante, incluso con internet lento o caído.
   ============================================================ */

const CACHE_NAME = 'zent-v78';
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
  './vendor/supabase-js.js',
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

/* El hosting puede redirigir /index.html a / o /login.html a /login.
   Una respuesta redirigida no se puede usar para una navegación, así
   que se reconstruye como respuesta normal antes de entregarla. */
async function sinRedireccion(response) {
  if (!response || !response.redirected) return response;
  try {
    const body = await response.blob();
    const headers = new Headers();
    const type = response.headers.get('content-type');
    if (type) headers.set('content-type', type);
    return new Response(body, { status: 200, statusText: 'OK', headers });
  } catch (error) {
    return response;
  }
}

async function primeraCopia(rutas) {
  for (var i = 0; i < rutas.length; i += 1) {
    var copia = await caches.match(rutas[i]);
    if (copia) return sinRedireccion(copia);
  }
  return null;
}

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
  // Supabase va siempre a la red.
  if (url.origin !== self.location.origin) return;

  const isDocument = request.mode === 'navigate' ||
    request.destination === 'document';
  const isCode = request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'worker' ||
    url.pathname.endsWith('.webmanifest');

  // Navegación y código: caché primero para que la app abra al instante
  // incluso sin internet. En paralelo se actualiza la copia para la
  // próxima apertura.
  if (isDocument || isCode) {
    const update = fetch(request, { cache: 'no-cache' })
      .then(async (response) => {
        if (response && response.ok && response.type === 'basic' && !response.redirected) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      })
      .catch(() => null);

    event.waitUntil(update.then(() => {}).catch(() => {}));

    event.respondWith((async () => {
      const cached = await caches.match(request, isDocument ? { ignoreSearch: true } : undefined);
      if (cached) return sinRedireccion(cached);

      const fresh = await update;
      if (fresh) return sinRedireccion(fresh);

      if (isDocument) {
        const esLogin = /\/login(\.html)?$/.test(url.pathname);
        const offline = await primeraCopia(
          esLogin
            ? ['./login.html', './login', './']
            : ['./', './index.html']
        );
        if (offline) return offline;
      }

      return new Response('', { status: 503, statusText: 'Sin conexión' });
    })());
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
