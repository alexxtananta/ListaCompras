const CACHE_NAME = 'lista-compras-cache-v1';
const urlsToCache = [
  '/ListaCompras/index.html',
  '/ListaCompras/style.css',
  '/ListaCompras/script.js',
  '/ListaCompras/manifest.json',
  '/ListaCompras/icons/icon-192x192.png', // Certifique-se de que estes ícones existam
  '/ListaCompras/icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});