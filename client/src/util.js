/* eslint-disable */
import React, { useCallback, useEffect, useRef, useState } from 'react';
// import deepKeys from 'deep-keys';
// import imagesLoaded from 'imagesloaded';
export const detectBrowser = () => {
  const { userAgent } = navigator;
  let match = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  let temp;

  if (/trident/i.test(match[1])) {
    temp = /\brv[ :]+(\d+)/g.exec(userAgent) || [];

    return `IE ${temp[1] || ''}`;
  }

  if (match[1] === 'Chrome') {
    temp = userAgent.match(/\b(OPR|Edge)\/(\d+)/);

    if (temp !== null) {
      return temp.slice(1).join(' ').replace('OPR', 'Opera');
    }

    temp = userAgent.match(/\b(Edg)\/(\d+)/);

    if (temp !== null) {
      return temp.slice(1).join(' ').replace('Edg', 'Edge (Chromium)');
    }
  }

  match = match[2] ? [match[1], match[2]] : [navigator.appName, navigator.appVersion, '-?'];
  temp = userAgent.match(/version\/(\d+)/i);

  if (temp !== null) {
    match.splice(1, 1, temp[1]);
  }

  return match.join(' ');
};
export const debounce = (fn) => {
  // This holds the requestAnimationFrame reference, so we can cancel it if we wish
  let frame;

  // The debounce function returns a new function that can receive a variable number of arguments
  return (...params) => {
    // If the frame variable has been defined, clear it now, and queue for next frame
    if (frame) {
      cancelAnimationFrame(frame);
    }

    // Queue our function call for the next frame
    frame = requestAnimationFrame(() => {
      // Call our function and pass any params we received
      fn(...params);
    });
  };
};
export const allowedRoutes = ['/', '/profile', '/login', '/discover'];
export function binarySearch(arr, n) {
  let min = 0;
  let max = arr.length - 1;
  let mid;
  while (min <= max) {
    mid = (min + max) >>> 1;
    if (arr[mid] === n) {
      return arr[mid];
    } else if (arr[mid] < n) {
      min = mid + 1;
    } else {
      max = mid - 1;
    }
  }
  return -1;
}
export function debounce_lodash(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  };
}

export function readEnvironmentVariable(key) {
  // See https://create-react-app.dev/docs/adding-custom-environment-variables/#docsNav
  return process.env[`REACT_APP_${key}`];
}
function renameKeys(obj, newKeys) {
  const keyValues = Object.keys(obj).map((key) => {
    const newKey = newKeys[key] || key;
    return { [newKey]: obj[key] };
  });
  return Object.assign({}, ...keyValues);
}
export function Counter(array, property) {
  let count = {};
  if (property) {
    array.forEach((val) => {
      count[val[property]] = (count[val[property]] || 0) + 1;
    });
  } else {
    array.forEach((val) => (count[val] = (count[val] || 0) + 1));
  }
  const nullExist = count['null'];
  if (nullExist) {
    count = renameKeys(count, { null: 'No Language' });
  }
  return Object.fromEntries(Object.entries(count).sort((a, b) => b[1] - a[1]));
}
export const fastFilter = (fn, a) => {
  const f = []; //final
  for (let i = 0; i < a.length; i++) {
    if (fn(a[i])) {
      f.push(a[i]);
    }
  }
  return f;
};
// export function missingDeepKeys(o1, o2, showIntermediate) {
//   //const o1 = {a: {b: 2}}; // Base object
//   // const o2 = {c: 1}; // Comparison object
//   //
//   // const result = missingDeepKeys(o1, o2);
//   //
//   // // Prints keys present in o1 but missing in o2
//   // console.log(result); // => ['a.b']
//   o1 = o1 || {};
//   o2 = o2 || {};
//   showIntermediate = showIntermediate || false;
//
//   return _.difference(deepKeys(o1, showIntermediate), deepKeys(o2, showIntermediate));
// }
export function millisToMinutesAndSeconds(millis) {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes > 0
    ? minutes +
        ` minute${minutes > 1 ? 's' : ''} and ` +
        (seconds < 10 ? '0' : '') +
        seconds +
        ` second${seconds > 0 ? 's' : ''}`
    : (seconds < 10 ? '0' : '') + seconds + ` second${seconds > 0 ? 's' : ''}`;
}
export function epochToJsDate(ts) {
  // ts = epoch timestamp
  // returns date obj
  if (ts) {
    const dateNow = new Date();
    const dateReset = new Date(ts * 1000);
    const diffTime = Math.abs(dateReset - dateNow);
    return millisToMinutesAndSeconds(diffTime);
  }
  return '';
}
export function offScreen(ref) {
  const rect = ref.current.getBoundingClientRect();
  return (
    rect.x + rect.current < 0 ||
    rect.y + rect.height < 0 ||
    rect.x + rect.current > window.innerWidth ||
    rect.y + rect.height > window.innerHeight
  );
}
export function isPropagationStopped(event) {
  if (typeof event.isPropagationStopped === 'function') {
    return event.isPropagationStopped();
  } else if (typeof event.cancelBubble !== 'undefined') {
    return event.cancelBubble;
  }
  return false;
}
export const useStableCallback = (callback) => {
  const onChangeInner = useRef();
  onChangeInner.current = callback;
  const stable = useCallback((...args) => onChangeInner.current(...args), []);
  return stable;
};
export function composeParamsHandler(fn, params, firstCallback, lastCallback) {
  if (params && firstCallback && !lastCallback) {
    return () => fn(params).then(firstCallback); // return callback so that it will execute when fn(event, ...args)
    // executed below due to onClick event
  } else if (params && firstCallback && lastCallback) {
    return () => fn(params).then(firstCallback).then(lastCallback);
  } else if (params) {
    return () => fn(params);
  } else {
    return fn;
  }
}
export function composeEventHandlers(...fns) {
  return (event, ...args) =>
    fns.some((fn) => {
      if (!isPropagationStopped(event) && fn) {
        fn(event, ...args);
      }
      return isPropagationStopped(event);
    });
}
export function isImageExists(url) {
  // Define the promise
  const imgPromise = new Promise(function imgPromise(resolve, reject) {
    // Create the image
    const imgElement = new Image();

    // When image is loaded, resolve the promise
    imgElement.addEventListener('load', function imgOnLoad() {
      resolve(url);
    });

    // When there's an error during load, reject the promise
    imgElement.addEventListener('error', function imgOnError() {
      reject();
    });

    // Assign URL
    imgElement.src = url;
  });

  return imgPromise;
}

// export function checkImagesLoaded(array, callback) {
//   // Grabs images in the ref
//   const collectedElements = array.querySelectorAll('img');
//   // Checks if the are elements in the DOM first of all
//   if (collectedElements.length !== 0) {
//     imagesLoaded(collectedElements, function (instance) {
//       if (instance.isComplete) {
//         const elements = instance.images.map((e, index) => {
//           // If the images is loaded and not broken
//           if (e.isLoaded) {
//             callback({ height: e.img.naturalHeight, src: e.img.src });
//           }
//         });
//       }
//     });
//   }
// }
export function progressPromise(promises, tickCallback) {
  const len = promises.length;
  let progress = 0;

  function tick(promise) {
    promise.then(function () {
      progress++;
      tickCallback(progress, len);
    });
    return promise;
  }

  return Promise.all(promises.map(tick));
}
let _loaded = false;
let _callbacks = [];
const _isTouch = window.ontouchstart !== undefined;

export const dragMove = function (target, handler, onStart, onEnd) {
  // Register a global event to capture mouse moves (once).
  if (!_loaded) {
    document.addEventListener(_isTouch ? 'touchmove' : 'mousemove', function (e) {
      let c = e;
      if (e.touches) {
        c = e.touches[0];
      }

      // On mouse move, dispatch the coords to all registered callbacks.
      for (var i = 0; i < _callbacks.length; i++) {
        _callbacks[i](c.clientX, c.clientY);
      }
    });
  }

  _loaded = true;
  let isMoving = false,
    hasStarted = false;
  let startX = 0,
    startY = 0,
    lastX = 0,
    lastY = 0;

  // On the first click and hold, record the offset of the pointer in relation
  // to the point of click inside the element.
  handler.addEventListener(_isTouch ? 'touchstart' : 'mousedown', function (e) {
    e.stopPropagation();
    e.preventDefault();
    if (target.dataset.dragEnabled === 'false') {
      return;
    }

    let c = e;
    if (e.touches) {
      c = e.touches[0];
    }

    isMoving = true;
    startX = target.offsetLeft - c.clientX;
    startY = target.offsetTop - c.clientY;
  });

  // On leaving click, stop moving.
  document.addEventListener(_isTouch ? 'touchend' : 'mouseup', function (e) {
    isMoving = false;
    hasStarted = false;

    if (onEnd && e.target === handler) {
      onEnd(target, parseInt(target.style.left), parseInt(target.style.top));
    }
  });

  // Register mouse-move callback to move the element.
  _callbacks.push(function move(x, y) {
    if (!isMoving) {
      return;
    }

    if (!hasStarted) {
      hasStarted = true;
      if (onStart) {
        onStart(target, lastX, lastY);
      }
    }

    lastX = x + startX;
    lastY = y + startY;

    // If boundary checking is on, don't let the element cross the viewport.
    if (target.dataset.dragBoundary === 'true') {
      if (lastX < 1 || lastX >= window.innerWidth - target.offsetWidth) {
        return;
      }
      if (lastY < 1 || lastY >= window.innerHeight - target.offsetHeight) {
        return;
      }
    }

    target.style.left = lastX + 'px';
    target.style.top = lastY + 'px';
  });
};
export const uniqFast = (a) => {
  const seen = {};
  const out = [];
  const len = a.length;
  let j = 0;
  for (let i = 0; i < len; i++) {
    const item = a[i];
    if (seen[item] !== 1) {
      seen[item] = 1;
      out[j++] = item;
    }
  }
  return out;
};
function createCallback(onResult, options, args) {
  if (onResult) {
    return (arg) => {
      if (!options.isCanceled) {
        return onResult(arg, args);
      }
      return arg;
    };
  }
}

function makeCancelable(promise, options) {
  const methods = {
    then(onSuccess, onError, args) {
      return makeCancelable(
        promise.then(createCallback(onSuccess, options, args), createCallback(onError, options)),
        options
      );
    },

    catch(onError) {
      return makeCancelable(promise.catch(createCallback(onError, options)), options);
    },

    finally(onFinally, runWhenCanceled) {
      if (runWhenCanceled) {
        if (!options.finallyList) {
          options.finallyList = [];
        }
        options.finallyList.push(onFinally);
      }
      return makeCancelable(
        promise.finally(() => {
          if (runWhenCanceled) {
            options.finallyList = options.finallyList.filter((callback) => callback !== onFinally);
          }
          return onFinally();
        }),
        options
      );
    },
    cancel() {
      options.isCanceled = true;
      for (const callbacks of [options.onCancelList, options.finallyList]) {
        if (callbacks) {
          while (callbacks.length) {
            const onCancel = callbacks.shift();
            if (typeof onCancel === 'function') {
              onCancel();
            }
          }
        }
      }
    },
    // cancel() {
    //   options.isCanceled = true;
    //   for (const callbacks of [options.onCancelList, options.finallyList]) {
    //     if (callbacks) {
    //       while (callbacks.length) {
    //         const onCancel = callbacks.shift();
    //         if (typeof onCancel === 'function') {
    //           onCancel();
    //         }
    //       }
    //     }
    //   }
    // },

    isCanceled() {
      return options.isCanceled === true;
    },
  };

  return {
    then: methods.then.bind(undefined),
    catch: methods.catch.bind(undefined),
    finally: methods.finally.bind(undefined),
    cancel: methods.cancel.bind(undefined),
    isCanceled: methods.isCanceled.bind(undefined),
  };
}

export function cancelable(promise) {
  return makeCancelable(promise, {});
}

export function CancelablePromise(executor) {
  const onCancelList = [];
  return makeCancelable(
    new Promise((resolve, reject) => {
      return executor(resolve, reject, (onCancel) => {
        onCancelList.push(onCancel);
      });
    }),
    { onCancelList }
  );
}

CancelablePromise.all = (iterable) => cancelable(Promise.all(iterable));
CancelablePromise.allSettled = (iterable) => cancelable(Promise.allSettled(iterable));
CancelablePromise.race = (iterable) => cancelable(Promise.race(iterable));
CancelablePromise.resolve = (value) => cancelable(Promise.resolve(value));
CancelablePromise.reject = (value) => cancelable(Promise.reject(value));

export async function pMap(iterable, mapper, { concurrency = Number.POSITIVE_INFINITY, stopOnError = true } = {}) {
  return new Promise((resolve, reject) => {
    if (typeof mapper !== 'function') {
      throw new TypeError('Mapper function is required');
    }

    const result = [];
    const errors = [];
    const iterator = iterable[Symbol.iterator]();
    let isRejected = false;
    let isIterableDone = false;
    let resolvingCount = 0;
    let currentIndex = 0;

    const next = () => {
      if (isRejected) {
        return;
      }

      const nextItem = iterator.next();
      const index = currentIndex;
      currentIndex++;

      if (nextItem.done) {
        isIterableDone = true;

        if (resolvingCount === 0) {
          if (!stopOnError && errors.length > 0) {
            reject(new AggregateError(errors));
          } else {
            resolve(result);
          }
        }

        return;
      }

      resolvingCount++;

      (async () => {
        try {
          const element = await nextItem.value;
          result[index] = await mapper(element, index);
          resolvingCount--;
          next();
        } catch (error) {
          if (stopOnError) {
            isRejected = true;
            reject(error);
          } else {
            errors.push(error);
            resolvingCount--;
            next();
          }
        }
      })();
    };

    for (let index = 0; index < concurrency; index++) {
      next();

      if (isIterableDone) {
        break;
      }
    }
  });
}
