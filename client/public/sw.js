// importScripts('https://cdn.jsdelivr.net/npm/idb@2.1.3/lib/idb.min.js');
// let db = idb.open('data');
//
// function getLocalRecords() {
//   return db.then((db) => db.transaction('apolloCache').objectStore('apolloCache').getAll());
// }
let username = '';
let cacheData = '';
const CACHE_NAME = 'cache';
addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting());
  console.log('SUCCESS INSTALL');
});
function readDB() {
  try {
    console.log('yee');
    fetch(`/api/end_of_session?username=${username}`, {
      method: 'POST',
      body: cacheData,
      headers: {
        'Content-Type': 'text/plain',
      },
    }).then(() => {
      console.log('[Service Worker]: /api/end_of_session SUCCESS');
    });
  } catch (e) {
    console.log(e);
  }
}
addEventListener('activate', (event) => {
  //register the client at first loading page
  //Once a new service worker has installed and a previous version isn't being used, the new one activates,
  // and you get an activate event. Because the old version is out of the way, it's a good time to delete unused caches.
  event.waitUntil(
    self.clients.claim().then(() => {
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cache) => caches.delete(cache)));
      });
    })
  );
});
addEventListener('message', (event) => {
  switch (event.data.type) {
    case 'username':
      username = event.data.username;
      break;
    case 'apolloCacheData':
      cacheData = event.data.cacheData;
      break;
    case 'execute':
      readDB();
      break;
    case 'logout':
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
  if (event.request.url.includes('/api') || event.request.url.includes('chrome-extension')) {
    return false;
  }
  if (event.request.mode !== 'navigate' && event.request.method === 'GET') {
    event.respondWith(
      caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(event.request).then(function (response) {
          return (
            response ||
            fetch(event.request).then(function (response) {
              cache.put(event.request, response.clone());
              return response;
            })
          );
        });
      })
    );
  }
});
