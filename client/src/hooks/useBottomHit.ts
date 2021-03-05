import { useCallback, useEffect, useMemo, useRef } from 'react';
import _ from 'lodash';
import { Maybe } from '../typing/interface';

export type DebounceOptions = Parameters<typeof _.debounce>[2];
export function useInterval(callback: VoidFunction, delay: number) {
  const savedCallback = useRef<Maybe<VoidFunction>>(null);

  /// / Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback]);

  useEffect(() => {
    function tick() {
      return savedCallback.current?.();
    }

    if (delay) {
      // Closure means closing over values outside the scope of the function.
      // This discrepancy is not because of scope. It's because once a function closes over a value,
      // it always references that variable. Which is what happened with the setInterval callback.
      // It got defined once and got attached to whatever the value of state was

      // setInterval always has access to the value of your component's first render because the function passed to
      // setInterval closes around that value and is never redeclared. You can use a custom hook to fix this:
      // so that when loading gets updated from handleOnScroll below, we will update savedCallback to reference the latest
      // interval callback, and it will be persisted across re-render due to setInterval API
      // we will re-declare setInterval callback
      const id = setInterval(() => {
        tick();
      }, delay);
      return () => {
        clearInterval(id);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);
}
function useBottomHit<T extends HTMLDivElement>(
  containerRef: any,
  onBottom: () => void,
  loading: boolean,
  debounce = 200,
  checkInterval = 500,
  threshold = 100,
  debounceOptions: DebounceOptions = { leading: true }
) {
  const debouncedOnBottom = useMemo(
    () => createCallback(debounce, onBottom, debounceOptions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debounce, onBottom]
  );
  const handleOnScroll = useCallback(() => {
    if (containerRef?.current !== undefined && !loading) {
      // use container to see the scroll hit bottom
      const rect = containerRef.current.getBoundingClientRect();
      const bottom = rect.bottom;
      const bottomOffset = bottom - window.innerHeight;
      const validOffset = bottomOffset < threshold;

      if (validOffset) {
        debouncedOnBottom();
      }
    } else if (containerRef?.current === undefined && !loading) {
      // use window for listening to scroll
      const doc = document.documentElement;
      const offset = doc.scrollTop + window.innerHeight;
      const height = doc.offsetHeight;
      if (offset >= height - threshold) {
        debouncedOnBottom();
      }
    }
    // re-declare useCallback when get new loading value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);
  useInterval(
    () => {
      handleOnScroll();
    },
    // don't listen to scroll when still loading, thus preventing onBottom cb to re-execute while it's still loading.
    !loading ? checkInterval : 0
  );
}
const createCallback = (debounce: number, handleOnScroll: () => void, options: DebounceOptions): (() => void) => {
  if (debounce) {
    return _.debounce(handleOnScroll, debounce, options);
  } else {
    return handleOnScroll;
  }
};

export default useBottomHit;
