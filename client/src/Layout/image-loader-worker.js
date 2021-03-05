self.addEventListener('message', (event) => {
  const url = event.data;
  fetch(url, {
    method: 'GET',
    mode: 'no-cors',
    cache: 'default',
  })
    .then((response) => {
      return response.blob();
    })
    .then((_) => postMessage(url))
    .catch(console.error);
});
