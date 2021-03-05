/* eslint-disable */
import React from 'react';
import imagesLoaded from 'imagesloaded';
import difference from 'lodash.difference';
import deepKeys from 'deep-keys';

export function readEnvironmentVariable(key) {
  // See https://create-react-app.dev/docs/adding-custom-environment-variables/#docsNav
  return process.env[`REACT_APP_${key}`];
}
export function Counter(array) {
  var count = {};
  array.forEach((val) => (count[val] = (count[val] || 0) + 1));
  return count;
}
export function missingDeepKeys(o1, o2, showIntermediate) {
  //const o1 = {a: {b: 2}}; // Base object
  // const o2 = {c: 1}; // Comparison object
  //
  // const result = missingDeepKeys(o1, o2);
  //
  // // Prints keys present in o1 but missing in o2
  // console.log(result); // => ['a.b']
  o1 = o1 || {};
  o2 = o2 || {};
  showIntermediate = showIntermediate || false;

  return difference(deepKeys(o1, showIntermediate), deepKeys(o2, showIntermediate));
}
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
// export function Loading(props) {
//   if (props.error) {
//     return (
//       <div>
//         Error! <button onClick={props.retry}>Retry?</button>
//       </div>
//     );
//   } else if (props.timedOut) {
//     return (
//       <div>
//         Taking a long time... <button onClick={props.retry}>Retry?</button>
//       </div>
//     );
//   } else if (props.pastDelay) {
//     //if greater than 300ms not yet imported, then show Loading...
//     return (
//       <div
//         style={{
//           textAlign: 'center',
//           margin: '0',
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           msTransform: 'translateY(-50%)',
//           transform: 'translateY(-50%)',
//         }}
//       >
//         <p style={{ fontSize: '20px' }}>
//           Please wait<span className="one">.</span>
//           <span className="two">.</span>
//           <span className="three">.</span>
//         </p>
//       </div>
//     );
//   } else {
//     return null;
//   }
// }
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
export const Loading = () => {
  return (
    <React.Fragment>
      <div
        className="loading-spinner"
        style={{
          height: 'auto',
          margin: '0 auto',
          padding: '10px',
          position: 'relative',
        }}
      />
      <h6>
        Loading<span className="one">.</span>
        <span className="two">.</span>
        <span className="three">.</span>
      </h6>
    </React.Fragment>
  );
};
const hasElementType = typeof Element !== 'undefined';
const hasMap = typeof Map === 'function';
const hasSet = typeof Set === 'function';
const hasArrayBuffer = typeof ArrayBuffer === 'function' && !!ArrayBuffer.isView;

// Note: We **don't** need `envHasBigInt64Array` in fde es6/index.js

function equal(a, b) {
  // START: fast-deep-equal es6/index.js 3.1.1
  if (a === b) return true;

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a.constructor !== b.constructor) return false;

    let length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false;
      return true;
    }

    // START: Modifications:
    // 1. Extra `has<Type> &&` helpers in initial condition allow es6 code
    //    to co-exist with es5.
    // 2. Replace `for of` with es5 compliant iteration using `for`.
    //    Basically, take:
    //
    //    ```js
    //    for (i of a.entries())
    //      if (!b.has(i[0])) return false;
    //    ```
    //
    //    ... and convert to:
    //
    //    ```js
    //    it = a.entries();
    //    while (!(i = it.next()).done)
    //      if (!b.has(i.value[0])) return false;
    //    ```
    //
    //    **Note**: `i` access switches to `i.value`.
    let it;
    if (hasMap && a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      it = a.entries();
      while (!(i = it.next()).done) if (!b.has(i.value[0])) return false;
      it = a.entries();
      while (!(i = it.next()).done) if (!equal(i.value[1], b.get(i.value[0]))) return false;
      return true;
    }

    if (hasSet && a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false;
      it = a.entries();
      while (!(i = it.next()).done) if (!b.has(i.value[0])) return false;
      return true;
    }
    // END: Modifications

    if (hasArrayBuffer && ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0; ) if (a[i] !== b[i]) return false;
      return true;
    }

    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
    // END: fast-deep-equal

    // START: react-fast-compare
    // custom handling for DOM elements
    if (hasElementType && a instanceof Element) return false;

    // custom handling for React/Preact
    for (i = length; i-- !== 0; ) {
      if ((keys[i] === '_owner' || keys[i] === '__v' || keys[i] === '__o') && a.$$typeof) {
        // React-specific: avoid traversing React elements' _owner
        // Preact-specific: avoid traversing Preact elements' __v and __o
        //    __v = $_original / $_vnode
        //    __o = $_owner
        // These properties contain circular references and are not needed when
        // comparing the actual elements (and not their owners)
        // .$$typeof and ._store on just reasonable markers of elements

        continue;
      }

      // all other properties should be traversed as usual
      if (!equal(a[keys[i]], b[keys[i]])) return false;
    }
    // END: react-fast-compare

    // START: fast-deep-equal
    return true;
  }

  return a !== a && b !== b;
}
// end fast-deep-equal

export function isEqualObjects(a, b) {
  try {
    return equal(a, b);
  } catch (error) {
    if ((error.message || '').match(/stack|recursion/i)) {
      // warn on circular references, don't crash
      // browsers give this different errors name and messages:
      // chrome/safari: "RangeError", "Maximum call stack size exceeded"
      // firefox: "InternalError", too much recursion"
      // edge: "Error", "Out of stack space"
      console.warn('react-fast-compare cannot handle circular refs');
      return false;
    }
    // some other error. we should definitely know about these
    throw error;
  }
}
export function checkImagesLoaded(array, callback) {
  // Grabs images in the ref
  const collectedElements = array.querySelectorAll('img');
  // Checks if the are elements in the DOM first of all
  if (collectedElements.length !== 0) {
    imagesLoaded(collectedElements, function (instance) {
      if (instance.isComplete) {
        const elements = instance.images.map((e, index) => {
          // If the images is loaded and not broken
          if (e.isLoaded) {
            callback({ height: e.img.naturalHeight, src: e.img.src });
          }
        });
      }
    });
  }
}
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

export const languageList = [
  'ABAP',
  'ActionScript',
  'Ada',
  'Agda',
  'AGS-Script',
  'Alloy',
  'AMPL',
  'ANTLR',
  'API-Blueprint',
  'APL',
  'Arc',
  'Arduino',
  'ASP',
  'AspectJ',
  'Assembly',
  'ATS',
  'AutoHotkey',
  'AutoIt',
  'BlitzMax',
  'Boo',
  'Brainfuck',
  'C#',
  'C',
  'Chapel',
  'Cirru',
  'Clarion',
  'Clean',
  'Click',
  'Clojure',
  'CoffeeScript',
  'ColdFusion-CFC',
  'ColdFusion',
  'Common-Lisp',
  'Component-Pascal',
  'C++',
  'Crystal',
  'CSS',
  'D',
  'Dart',
  'Diff',
  'DM',
  'Dogescript',
  'Dylan',
  'E',
  'Eagle',
  'eC',
  'ECL',
  'edn',
  'Eiffel',
  'Elixir',
  'Elm',
  'Emacs-Lisp',
  'EmberScript',
  'Erlang',
  'F#',
  'Factor',
  'Fancy',
  'Fantom',
  'FLUX',
  'Forth',
  'FORTRAN',
  'FreeMarker',
  'Frege',
  'Game-Maker-Language',
  'Glyph',
  'Gnuplot',
  'Go',
  'Golo',
  'Gosu',
  'Grammatical-Framework',
  'Groovy',
  'Handlebars',
  'Harbour',
  'Haskell',
  'Haxe',
  'HTML',
  'Hy',
  'IDL',
  'Io',
  'Ioke',
  'Isabelle',
  'J',
  'Java',
  'JavaScript',
  'JFlex',
  'JSONiq',
  'Julia',
  'Jupyter-Notebook',
  'Kotlin',
  'KRL',
  'Lasso',
  'Latte',
  'Lex',
  'LFE',
  'LiveScript',
  'LookML',
  'LSL',
  'Lua',
  'Makefile',
  'Mask',
  'Matlab',
  'Max',
  'MAXScript',
  'Mercury',
  'Metal',
  'NCL',
  'Nemerle',
  'nesC',
  'NetLinx',
  'NetLinx-ERB',
  'NetLogo',
  'NewLisp',
  'Nimrod',
  'Nit',
  'Nix',
  'Nu',
  'Objective-C',
  'Objective-C++',
  'Objective-J',
  'OCaml',
  'Omgrofl',
  'ooc',
  'Opal',
  'Oxygene',
  'Oz',
  'Pan',
  'Papyrus',
  'Parrot',
  'Pascal',
  'PAWN',
  'Perl',
  'Perl6',
  'PHP',
  'PigLatin',
  'Pike',
  'PLSQL',
  'PogoScript',
  'Processing',
  'Prolog',
  'Propeller-Spin',
  'Puppet',
  'Pure Data',
  'PureBasic',
  'PureScript',
  'Python',
  'QML',
  'R',
  'Racket',
  'Ragel-in-Ruby-Host',
  'RAML',
  'Rebol',
  'Red',
  'Ren-Py',
  'Rouge',
  'Ruby',
  'Rust',
  'SaltStack',
  'SAS',
  'Scala',
  'Scheme',
  'Self',
  'Shell',
  'Shen',
  'Slash',
  'Slim',
  'Smalltalk',
  'SourcePawn',
  'SQF',
  'Squirrel',
  'Stan',
  'Standard-ML',
  'SuperCollider',
  'Swift',
  'SystemVerilog',
  'Tcl',
  'TeX',
  'Turing',
  'TypeScript',
  'Unified-Parallel-C',
  'Unity3D-Asset',
  'UnrealScript',
  'Vala',
  'Verilog',
  'VHDL',
  'VimL',
  'Visual-Basic',
  'Volt',
  'Vue',
  'Web-Ontology-Language',
  'wisp',
  'X10',
  'xBase',
  'XC',
  'XQuery',
];
