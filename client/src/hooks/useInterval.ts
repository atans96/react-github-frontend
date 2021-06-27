import { useEffect, useRef } from 'react';
import { Maybe } from '../typing/interface';
import { debounce_lodash } from '../util';

export type DebounceOptions = Parameters<typeof debounce_lodash>[2];
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
