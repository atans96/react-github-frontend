import React, { RefObject, useCallback, useDebugValue, useEffect, useLayoutEffect, useRef, useState } from 'react';
import warning from 'tiny-warning';
import { AssignableRef } from '../typing/interface';
import { RSSSource } from './RSSSource';
import { getRateLimitInfo, removeTokenGQL } from '../services';
import { dispatchRateLimit, dispatchRateLimitAnimation } from '../store/dispatcher';

type AnyFunction = (...args: any[]) => unknown;

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {};
export const filterActionResolvedPromiseData = (input: any, filter1: any, ...args: any) => {
  if (!!input.language && filter1) {
    //sometimes the language can be null but we've already seen it
    return input;
  } else if (filter1 && args) {
    return input;
  }
};

export function millisToMinutesAndSeconds(millis: any) {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  return +(minutes * 60 + Number(seconds)).toFixed(0);
}

export function epochToJsDate(ts: any) {
  // ts = epoch timestamp
  // returns date obj
  if (ts) {
    const dateNow: any = new Date();
    const dateReset: any = new Date(ts * 1000);
    const diffTime = Math.abs(dateReset - dateNow);
    return millisToMinutesAndSeconds(diffTime);
  }
  return 0;
}

export function getElementHeight(el: RefObject<HTMLElement> | { current?: { scrollHeight: number } }): string | number {
  if (!el?.current) {
    warning(
      true,
      `useCollapse was not able to find a ref to the collapse element via \`getCollapseProps\`. Ensure that the element exposes its \`ref\` prop. If it exposes the ref prop under a different name (like \`innerRef\`), use the \`refKey\` property to change it. Example:
{...getCollapseProps({refKey: 'innerRef'})}`
    );
    return 'auto';
  }
  return el.current.scrollHeight;
}

// Helper function for render props. Sets a function to be called, plus any additional functions passed in
export const callAll = (...fns: AnyFunction[]) => (...args: any[]): void => fns.forEach((fn) => fn && fn(...args));

// https://github.com/mui-org/material-ui/blob/da362266f7c137bf671d7e8c44c84ad5cfc0e9e2/packages/material-ui/src/styles/transitions.js#L89-L98
export function getAutoHeightDuration(height: number | string): number {
  if (!height || typeof height === 'string') {
    return 0;
  }

  const constant = height / 36;

  // https://www.wolframalpha.com/input/?i=(4+%2B+15+*+(x+%2F+36+)+**+0.25+%2B+(x+%2F+36)+%2F+5)+*+10
  return Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10);
}

export function assignRef<RefValueType = any>(ref: AssignableRef<RefValueType> | null | undefined, value: any) {
  if (ref == null) return;
  if (typeof ref === 'function') {
    ref(value);
  } else {
    try {
      ref.current = value;
    } catch (error) {
      throw new Error(`Cannot assign value "${value}" to ref "${ref}"`);
    }
  }
}

/**
 * Passes or assigns a value to multiple refs (typically a DOM node). Useful for
 * dealing with components that need an explicit ref for DOM calculations but
 * also forwards refs assigned by an app.
 *
 * @param refs Refs to fork
 */
export function mergeRefs<RefValueType = any>(...refs: (AssignableRef<RefValueType> | null | undefined)[]) {
  if (refs.every((ref) => ref == null)) {
    return null;
  }
  return (node: any) => {
    refs.forEach((ref) => {
      assignRef(ref, node);
    });
  };
}
export function useControlledState(
  isExpanded?: boolean,
  defaultExpanded?: boolean
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const [stateExpanded, setStateExpanded] = useState(defaultExpanded || false);
  const initiallyControlled = useRef(isExpanded != null);
  const expanded = initiallyControlled.current ? (isExpanded as boolean) : stateExpanded;
  const setExpanded = useCallback((fn) => {
    if (!initiallyControlled.current) {
      setStateExpanded(fn);
    }
  }, []);

  useEffect(() => {
    warning(
      !(initiallyControlled.current && isExpanded == null),
      'useCollapse is changing from controlled to uncontrolled. useCollapse should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled collapse for the lifetime of the component. Check the `isExpanded` prop.'
    );
    warning(
      !(!initiallyControlled.current && isExpanded != null),
      'useCollapse is changing from uncontrolled to controlled. useCollapse should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled collapse for the lifetime of the component. Check the `isExpanded` prop.'
    );
  }, [isExpanded]);

  return [expanded, setExpanded];
}

export function useEffectAfterMount(cb: () => void, dependencies: unknown[]): void {
  const justMounted = useRef(true);
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (!justMounted.current) {
      return cb();
    }
    justMounted.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}

/**
 * Taken from Reach
 * https://github.com/reach/reach-ui/blob/d2b88c50caf52f473a7d20a4493e39e3c5e95b7b/packages/auto-id
 *
 * Autogenerate IDs to facilitate WAI-ARIA and server rendering.
 *
 * Note: The returned ID will initially be `null` and will update after a
 * component mounts. Users may need to supply their own ID if they need
 * consistent values for SSR.
 *
 * @see Docs https://reach.tech/auto-id
 */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useEffect : useLayoutEffect;
let serverHandoffComplete = false;
let id = 0;
const genId = () => ++id;

export function useUniqueId(idFromProps?: string | null) {
  /*
   * If this instance isn't part of the initial render, we don't have to do the
   * double render/patch-up dance. We can just generate the ID and return it.
   */
  const initialId = idFromProps || (serverHandoffComplete ? genId() : null);

  const [id, setId] = useState(initialId);

  useIsomorphicLayoutEffect(() => {
    if (id === null) {
      /*
       * Patch the ID after render. We do this in `useLayoutEffect` to avoid any
       * rendering flicker, though it'll make the first render slower (unlikely
       * to matter, but you're welcome to measure your app and let us know if
       * it's a problem).
       */
      setId(genId());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (serverHandoffComplete === false) {
      /*
       * Flag all future uses of `useId` to skip the update dance. This is in
       * `useEffect` because it goes after `useLayoutEffect`, ensuring we don't
       * accidentally bail out of the patch-up dance prematurely.
       */
      serverHandoffComplete = true;
    }
  }, []);
  return id != null ? String(id) : undefined;
}

export function usePaddingWarning(element: RefObject<HTMLElement>): void {
  const warn = (el?: RefObject<HTMLElement>): void => {};

  useEffect(() => {
    warn(element);
  }, [element]);
}

export function useStateWithLabel(initialValue: any, name: string) {
  //so that when you debug, it will show the name of the states
  const [value, setValue] = useState(initialValue);
  useDebugValue(`${name}: ${value}`);
  return [value, setValue];
}

export async function addRSSFeed(url: string) {
  const source = new RSSSource(url);
  try {
    const feed = await RSSSource.fetchMetaData(source);
    return feed;
  } catch (e) {
    console.log('error');
    throw e;
  }
}

export function logoutAction(history: any, dispatch: any, dispatchStargazers: any) {
  history.push('/');
  removeTokenGQL().then(noop);
  dispatch({ type: 'LOGOUT' });
  dispatchStargazers({ type: 'LOGOUT' });
  dispatchRateLimitAnimation(false, dispatch);
  getRateLimitInfo(null).then((data) => {
    if (data.rateLimit && data.rateLimitGQL) {
      dispatchRateLimitAnimation(true, dispatch);
      dispatchRateLimit(data.rateLimit, data.rateLimitGQL, dispatch);
    }
  });
  window.location.reload(false); // full refresh to reset everything at all components
}
