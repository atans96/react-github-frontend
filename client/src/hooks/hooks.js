import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { composeEventHandlers, composeParamsHandler, useStableCallback } from '../util';
import useResizeObserver from './useResizeObserver';

export function useOuterClick(callback) {
  const callbackRef = useRef(); // initialize mutable ref, which stores callback
  const innerRef = useRef(); // returned to client, who marks "border" element

  // update cb on each render, so second useEffect has access to current value
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
    function handleClick(e) {
      if (innerRef.current && callbackRef.current && !innerRef.current.contains(e.target)) {
        callbackRef.current(e);
      }
    }
  }, []); // no dependencies -> stable click listener

  return innerRef; // convenience for client (doesn't need to init ref himself)
}

export function useClickOutside(ref, handler, exception = []) {
  const handleClickOutside = useStableCallback((event) => {
    if (
      !ref?.current ||
      (ref?.current?.contains && ref?.current?.contains(event.target)) ||
      exception.some((substring) => {
        //at least there's one true for this regex pattern
        return new RegExp(substring).test(event?.target?.parentElement?.className);
      })
    ) {
      return;
    }
    handler(event);
  });
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
    () =>
      ({
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
    () =>
      ({ refKey = 'ref', ...rest } = {}) => {
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
export function useResizeObserverWithRAF(opts, ...args) {
  const [size, setSize] = useState({ width: undefined, height: undefined });
  const { ref } = useResizeObserver({
    ...opts,
    onResize: (size) => requestAnimationFrame(() => setSize(size)),
  });

  return { size, ref };
}
export function useCheckStateExists(state, callback = (state) => state.length > 0) {
  const [exist, setExist] = useState(false);
  function isStateExist(state, callback) {
    return new Promise(function checkState(resolve, reject) {
      if (callback(state)) {
        resolve(state);
      }
    });
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
export const useBoundingRect = (ref) => {
  const [bbox, setBbox] = useState({});

  const set = () => setBbox(ref && ref.current ? ref.current.getBoundingClientRect() : {});

  useEffect(() => {
    set();
    window.addEventListener('resize', set);
    return () => window.removeEventListener('resize', set);
  }, []);

  return bbox;
};
