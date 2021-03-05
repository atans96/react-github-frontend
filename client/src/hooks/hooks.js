import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { composeEventHandlers, composeParamsHandler } from '../util';
import ResizeObserver from 'resize-observer-polyfill';
export function useClickOutside(ref, handler, exception = []) {
  const handleClickOutside = useCallback(
    (event) => {
      if (
        !ref?.current ||
        ref?.current.contains(event.target) ||
        exception.some((substring) => {
          //at least there's one true for this regex pattern
          return new RegExp(substring).test(event.target.parentElement.className);
        })
      ) {
        return;
      }
      handler();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ref, exception]
  );
  useEffect(() => {
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleClickOutside]);
}
export function useEventHandlerComposer({ onClickCb } = {}) {
  const rootRef = useRef(null);
  const getRootProps = useMemo(
    () => ({
      refKey = 'ref', // if refKey not supplied, the default is 'ref'
      onClick,
      params = undefined,
      firstCallback = undefined,
      lastCallback = undefined,
      ...rest
    } = {}) => ({
      onClick: composeEventHandlers(onClick, composeParamsHandler(onClickCb, params, firstCallback, lastCallback)),
      [refKey]: rootRef,
      ...rest,
    }),
    [rootRef, onClickCb]
  );
  const getInputProps = useMemo(
    () => ({ refKey = 'ref', ...rest } = {}) => {
      return {
        ...rest,
      };
    },
    []
  );
  return {
    getRootProps,
    getInputProps,
  };
}
export function useMutationObserver(targetNode, config, callback) {
  const [value, setValue] = useState(undefined);
  const observer = useMemo(
    () =>
      new MutationObserver((mutationList, observer) => {
        const result = callback(mutationList, observer);
        setValue(result);
      }),
    [callback]
  );
  useEffect(() => {
    if (targetNode) {
      observer.observe(targetNode, config);
      return () => {
        observer.disconnect();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetNode, config]);

  return value;
}
export function useResizeHandler(windowScreenRef, callback) {
  useEffect(() => {
    const el = windowScreenRef.current;
    if (el === undefined) {
      return;
    }

    // resize observer is a tool you can use to watch for size changes efficiently
    const resizeObserver = new ResizeObserver(callback);
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
export function useCheckStateExists(state, callback = (state) => state.length > 0) {
  const [exist, setExist] = useState(false);
  function isStateExist(state, callback) {
    const statePromise = new Promise(function checkState(resolve, reject) {
      if (callback(state)) {
        resolve(state);
      }
    });

    return statePromise;
  }
  useEffect(() => {
    isStateExist(state, callback).then((status) => {
      if (status) {
        setExist(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return exist;
}
