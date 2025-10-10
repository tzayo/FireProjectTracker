// מערכת ניהול כיבוי אש - Service Worker for Offline Support
const CACHE_NAME = 'fire-safety-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/js/bundle.js',
  '/manifest.json'
];

// התקנת Service Worker וקאשינג של קבצים
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// הפעלת Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// טיפול בבקשות - Cache First Strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // החזרת תשובה מהקאש אם קיימת
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // בדיקה שהתשובה תקינה
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // שכפול התשובה
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // במקרה של כישלון (אופליין), החזרת דף offline
        return caches.match('/');
      })
  );
});

// טיפול בהודעות מהאפליקציה
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// התראות Push (לעתיד)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/fire-icon-192.png',
    badge: '/fire-icon-192.png',
    vibrate: [200, 100, 200],
    dir: 'rtl',
    lang: 'he'
  };

  event.waitUntil(
    self.registration.showNotification('מערכת כיבוי אש', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
