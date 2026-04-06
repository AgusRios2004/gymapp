const CACHE_NAME = 'gym-app-v1';

self.addEventListener('install', (event) => {
  // Opcional: precaching
});

self.addEventListener('fetch', (event) => {
  // Ignorar peticiones a la API para evitar conflictos CORS o problemas de interceptación
  if (event.request.url.includes('/api/')) {
    return;
  }

  // Esto es necesario para que sea detectable como PWA para otros recursos (HTML, JS, CSS)
  event.respondWith(fetch(event.request));
});
