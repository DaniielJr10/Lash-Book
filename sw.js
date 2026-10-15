const CACHE_NAME = 'lash-book-static-v3';
const APP_SHELL = [
  './inicio.html',
  './inicio.css',
  './inicio.js',
  './storage.js',
  './pwa.js',
  './manifest.json',
  './icon.svg',
  './agendar_cita/agendar.html',
  './agendar_cita/agendar.css',
  './agendar_cita/agendar.js',
  './clientas/clientas.html',
  './clientas/clientas.css',
  './clientas/clientas.js',
  './misclientas/mis.html',
  './misclientas/mis.css',
  './misclientas/mis.js',
  './misclientas/detalle.html',
  './misclientas/detalle.css',
  './misclientas/detalle.js',
  './misclientas/lista.html',
  './misclientas/lista.css',
  './misclientas/lista.js',
  './finanzas/finanzas.html',
  './finanzas/finanzas.css',
  './finanzas/finanzas.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./inicio.html')))
  );
});
