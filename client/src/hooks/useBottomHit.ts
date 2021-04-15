import { useCallback, useMemo } from 'react';
import _ from 'lodash';
import { DebounceOptions, useInterval } from './useInterval';

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
