import { useLayoutEffect, useRef, useState } from 'react';
import { noop } from '../util/util';

const defaultOptions = {
  root: undefined,
  rootMargin: '0px',
  threshold: 0,
};

/**
 * Uses the IntersectionObserverMock API to tell whether the given DOM Element (from useRef) is visible within the
 * viewport.
 */
export const useViewportSpy = (elementRef: any, options = defaultOptions) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const isVisibleRef = useRef<boolean>(false);
  const disconnected = useRef<boolean>(false);
  useLayoutEffect(
    () => {
      if (!disconnected.current) {
        if (!supportsObserverAPI()) {
          setIsVisible(true);
          return noop;
        }
        const observer = new IntersectionObserver(
          (entries) =>
            entries.forEach((item) => {
              const nextValue = item.isIntersecting;
              if (nextValue && !isVisibleRef.current) {
                setIsVisible(nextValue);
              }
            }),
          options
        );
        if (isVisibleRef.current) {
          observer.disconnect();
          disconnected.current = true;
        }
        observer.observe(elementRef.current);

        return () => {
          observer.disconnect(); // eslint-disable-line react-hooks/exhaustive-deps
        };
      }
    },
    [elementRef] // eslint-disable-line react-hooks/exhaustive-deps
  );
  if (!isVisibleRef.current && isVisible) {
    isVisibleRef.current = isVisible;
  }
  return isVisibleRef.current;
};

function supportsObserverAPI() {
  return typeof IntersectionObserver === 'function';
}
