// importScripts('https://cdn.jsdelivr.net/npm/idb@2.1.3/lib/idb.min.js');
// let db = idb.open('data');
//
// function getLocalRecords() {
//   return db.then((db) => db.transaction('apolloCache').objectStore('apolloCache').getAll());
// }
let username = '';
let cacheData = {};
const preCache = [
  '/static/media/new_16-2.d9260786.gif',
  'https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap',
  'https://cdn.jsdelivr.net/npm/bootstrap@3.3.5/dist/css/bootstrap.min.css',
];
const CACHE_NAME = 'cache';
addEventListener('install', (e) => {
  //register the client at first loading page
  //Once a new service worker has installed and a previous version isn't being used, the new one activates,
  // and you get an activate event. Because the old version is out of the way, it's a good time to delete unused caches.
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((cache) => caches.delete(cache)));
    })
  );
});
addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim().then(() => {
      caches.open(CACHE_NAME).then(function (cache) {
        return Promise.all(
          preCache.map((link) => {
            fetch(link).then(function (response) {
              cache.put(link, response.clone());
            });
          })
        );
      });
    })
  );
});
addEventListener('message', (event) => {
  switch (event.data.type) {
    case 'username':
      username = event.data.username;
      break;
    case 'SKIP_WAITING':
      self.skipWaiting().then(() => {});
      break;
    case 'logout':
      console.log('logout');
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cache) => caches.delete(cache))).then(() => {
          self.registration
            .unregister()
            .then(function () {
              return self.clients.matchAll();
            })
            .then(function (clients) {
              clients.forEach((client) => client.navigate(client.url));
            });
        });
      });
      break;
  }
});
addEventListener('fetch', function (event) {
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
    return false;
  }
  if (/\.(png|gif|jpg|jpeg|svg|webp).*$/.test(event.request.url)) {
    return false;
  }
  if (
    event.request.url.includes('/server') ||
    event.request.url.includes('/graphql') ||
    event.request.url.includes('chrome-extension') ||
    event.request.url.includes('.js')
  ) {
    return false;
  }
  if (event.request.mode !== 'navigate' && event.request.method === 'GET') {
    event.respondWith(
      caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(event.request).then(function (response) {
          return (
            response ||
            fetch(event.request).then(function (response) {
              if (response.type !== 'opaque') {
                cache.put(event.request, response.clone());
              }
              return response;
            })
          );
        });
      })
    );
  }
});
const channel = new BroadcastChannel('sw-messages');
addEventListener('push', (e) => {
  console.log(e.data.json());
  channel.postMessage(e.data.json());
});
addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'ok') {
    event.waitUntil(self.client.openWindow(event.notification.data.url));
  }
});
addEventListener('notificationclose', () => {
  // Log analytical data
});
