import { RefObject } from 'react';
import { ResizeObserver, ResizeObserverEntry } from '@juggle/resize-observer';
import useLatest from '@react-hook/latest';
import useLayoutEffect from '@react-hook/passive-layout-effect';
import rafSchd from 'raf-schd';

function useResizeObserver<T extends HTMLElement>(
  target: RefObject<T> | T | null,
  callback: UseResizeObserverCallback
): ResizeObserver {
  const resizeObserver = getResizeObserver();
  const storedCallback = useLatest(callback);

  useLayoutEffect(() => {
    let didUnsubscribe = false;
    const targetEl = target && 'current' in target ? target.current : target;
    if (!targetEl) return;

    resizeObserver.subscribe(targetEl, (entry: ResizeObserverEntry, observer: ResizeObserver) => {
      if (didUnsubscribe) return;
      storedCallback.current(entry, observer);
    });

    return () => {
      didUnsubscribe = true;
      resizeObserver.unsubscribe(targetEl);
    };
  }, [target, resizeObserver, storedCallback]);

  return resizeObserver.observer;
}

function createResizeObserver() {
  const callbacks: Map<any, UseResizeObserverCallback> = new Map();
  const observer = new ResizeObserver(
    rafSchd((entries, observer) => {
      if (entries.length === 1) {
        callbacks.get(entries[0].target)?.(entries[0], observer);
      } else {
        for (let i = 0; i < entries.length; i++) {
          callbacks.get(entries[i].target)?.(entries[i], observer);
        }
      }
    })
  );

  return {
    observer,
    subscribe(target: HTMLElement, callback: UseResizeObserverCallback) {
      observer.observe(target);
      callbacks.set(target, callback);
    },
    unsubscribe(target: HTMLElement) {
      observer.unobserve(target);
      callbacks.delete(target);
    },
  };
}

let _resizeObserver: ReturnType<typeof createResizeObserver>;

const getResizeObserver = () => (!_resizeObserver ? (_resizeObserver = createResizeObserver()) : _resizeObserver);

export type UseResizeObserverCallback = (entry: ResizeObserverEntry, observer: ResizeObserver) => any;

export default useResizeObserver;
