import { sortBy } from '../util';

declare global {
  interface HTMLImageElement {
    load: Function;
    completedPercentage: number;
  }
  interface Promise {
    progress: Function;
  }
  interface Array {
    extend: Function;
    sortBy: Function;
  }
}
// eslint-disable-next-line no-extend-native
Image.prototype.load = function (url: string) {
  const thisImg = this;
  const xmlHTTP = new XMLHttpRequest();
  xmlHTTP.open('GET', url, true);
  xmlHTTP.responseType = 'arraybuffer';
  xmlHTTP.onload = function (e) {
    const blob = new Blob([this.response]);
    thisImg.src = window.URL.createObjectURL(blob);
  };
  xmlHTTP.onprogress = function (e) {
    thisImg.completedPercentage = parseInt(String((e.loaded / e.total) * 100));
  };
  xmlHTTP.onloadstart = function () {
    thisImg.completedPercentage = 0;
  };
  xmlHTTP.send();
};
// eslint-disable-next-line no-extend-native
Image.prototype.completedPercentage = 0;
// eslint-disable-next-line no-extend-native
Promise.prototype.progress = async function progress(iterable, onprogress) {
  // consume iterable synchronously and convert to array of promises
  const promises = Array.from(iterable).map(this.resolve, this);
  let resolved = 0;

  // helper function for emitting progress events
  const progress = (increment) =>
    this.resolve(
      onprogress(
        new ProgressEvent('progress', {
          total: promises.length,
          loaded: (resolved += increment),
        })
      )
    );
  // lift all progress events off the stack
  await this.resolve();
  // emit 0 progress event
  await progress(0);

  // emit a progress event each time a promise resolves
  return this.all(promises.map((promise) => promise.finally(() => progress(1))));
};
// eslint-disable-next-line no-extend-native
Array.prototype.extend = function (other_array) {
  /* https://stackoverflow.com/questions/1374126/how-to-extend-an-existing-javascript-array-with-another-array-without-creating/17368101#17368101 */
  other_array.forEach(function (v) {
    this.push(v);
  }, this);
};
Array.prototype.sortBy = sortBy();
export {};
