const CACHE_NAME = 'fixpin-v6-cache';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.15.0/maps/maps.css',
  'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.15.0/maps/maps-web.min.js'
];

// Установка воркера - скачиваем ресурсы в кэш
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Активация - удаляем старый кэш, если обновили версию
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Стратегия: Сначала проверяем сеть. Если сети нет — берем из кэша.
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});