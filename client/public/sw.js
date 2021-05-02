importScripts('https://cdn.jsdelivr.net/npm/idb@2.1.3/lib/idb.min.js');
let db = idb.open('data');

function getLocalRecords() {
  return db.then((db) => db.transaction('apolloCache').objectStore('apolloCache').getAll());
}
addEventListener('install', () => {
  console.log('[Service Worker]: Install success');
});
function readDB() {
  getLocalRecords().then((records) => {
    return fetch('/api/end_of_session', {
      method: 'POST',
      body: JSON.stringify(records),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(() => {
      console.log('SUCCESS');
    });
  });
}

addEventListener('sync', (event) => {
  if (event.tag === 'apolloCacheToDatabase') {
    event.waitUntil(readDB());
  }
});
