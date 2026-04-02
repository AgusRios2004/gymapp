const CACHE_NAME = 'gym-app-v1';

self.addEventListener('install', (event) => {
  // Opcional: precaching
});

self.addEventListener('fetch', (event) => {
  // Esto es necesario para que sea detectable como PWA
  event.respondWith(fetch(event.request));
});
