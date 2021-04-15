import React, { RefObject, useCallback, useDebugValue, useEffect, useLayoutEffect, useRef, useState } from 'react';
import warning from 'tiny-warning';
import { AssignableRef, IAction } from '../typing/interface';
import { RSSSource } from './RSSSource';
import { removeTokenGQL } from '../services';
import { ActionShared } from '../store/Shared/reducer';
type AnyFunction = (...args: any[]) => unknown;
type TTestFunction<T> = (data: T, index: number, list: SinglyLinkedList<T>) => boolean;
type TMapFunction<T> = (data: any, index: number, list: SinglyLinkedList<T>) => any;

class SinglyLinkedListNode<T> {
  data: T | any;
  next: SinglyLinkedListNode<T> | null;
  prev: SinglyLinkedListNode<T> | null;

  constructor(args: SinglyLinkedListNode<T>) {
    this.data = args.data;
    this.next = args.next;
    this.prev = args.prev;
  }
}

export class SinglyLinkedList<T> {
  public head: SinglyLinkedListNode<T> | null;
  public tail: SinglyLinkedListNode<T> | null;

  constructor() {
    this.head = null;
    this.tail = null;
  }

  public fromArrayLeftToRight<T>(items: T[]) {
    items.reduce((acc: any, item) => {
      const node = new SinglyLinkedListNode<T>({ data: item, prev: this.tail, next: null });
      if (this.head === null) {
        this.head = node;
      }
      if (this.tail !== null) {
        this.tail.next = node;
      }
      this.tail = node;

      return node;
    }, null);

    return this;
  }

  /**
   * The map() method creates a new list with the results of
   * calling a provided function on every node in the calling list.
   * ```ts
   * new LinkedList(1, 2, 3).map(data => data + 10); // 11 <=> 12 <=> 13
   * ```
   * @param f Function that produces an node of the new list, taking up to three arguments
   * @param reverse Indicates if the list should be mapped in reverse order, default is false
   */
  public map(f: TMapFunction<T>, reverse = false) {
    const list = new SinglyLinkedList();
    this.forEach((data, index) => list.fromArrayLeftToRight(f(data, index, this)), reverse);
    return list;
  }

  /**
   * The forEach() method executes a provided function once for each list node.
   * ```ts
   * new LinkedList(1, 2, 3).forEach(data => log(data)); // 1 2 3
   * ```
   * @param f Function to execute for each element, taking up to three arguments.
   * @param reverse Indicates if the list should be walked in reverse order, default is false
   */
  public forEach(f: TMapFunction<T>, reverse = false): void {
    let currentIndex = 0;
    let currentNode = this.head;
    const modifier = reverse ? -1 : 1;
    const nextNode = reverse ? 'prev' : 'next';
    while (currentNode) {
      f(currentNode.data, currentIndex, this);
      currentNode = currentNode[nextNode];
      currentIndex += modifier;
    }
  }

  /**
   * Return the first node and its index in the list that
   * satisfies the testing function
   * ```ts
   * new LinkedList(1, 2, 3).findNodeIndex(data => data === 1);
   * // { node: LinkedListNode, index: 0 }
   * ```
   * @param f A function to be applied to the data of each node
   */
  public findNodeIndex(
    f: TTestFunction<T>
  ):
    | {
        node: SinglyLinkedListNode<T>;
        index: number;
      }
    | undefined {
    let currentIndex = 0;
    let currentNode = this.head;
    while (currentNode) {
      if (f(currentNode.data, currentIndex, this)) {
        return {
          index: currentIndex,
          node: currentNode,
        };
      }
      currentNode = currentNode.next;
      currentIndex += 1;
    }
    return undefined;
  }

  /**
   * The iterator implementation
   * ```ts
   * const list = new LinkedList(1, 2, 3);
   * for (const data of list) { log(data); } // 1 2 3
   * ```
   */
  public *[Symbol.iterator](): IterableIterator<T> {
    let element = this.head;

    while (element !== null) {
      yield element.data;
      element = element.next;
    }
  }

  public getAt(list: SinglyLinkedList<T>, index: number) {
    let counter = 0;
    let node = list.head;
    while (node) {
      if (counter === index) {
        return node;
      }
      counter++;
      node = node.next;
    }
    return null;
  }

  /**
   * Merge the current list with another. Both lists will be
   * equal after merging.
   * ```ts
   * const list = new LinkedList(1, 2);
   * const otherList = new LinkedList(3);
   * list.merge(otherList);
   * (list === otherList); // true
   * ```
   * @param list The list to be merged
   */
  public merge(list: SinglyLinkedList<T>): void {
    if (this.tail !== null) {
      this.tail.next = list.head;
    }
    if (list.head !== null) {
      list.head.prev = this.tail;
    }
    this.head = this.head || list.head;
    this.tail = list.tail || this.tail;
    list.head = this.head;
    list.tail = this.tail;
  }

  public fromArrayRightToLeft<T>(items: T[]) {
    items.reduceRight((acc: any, item) => {
      const node = new SinglyLinkedListNode<T>({ data: item, prev: null, next: this.head });
      if (this.tail === null) {
        this.tail = node;
      }
      if (this.head !== null) {
        this.head.prev = node;
      }
      this.head = node;
      return node;
    }, null);

    return this;
  }

  public toString(): string {
    let curr = this.head;
    let str = '';

    while (curr !== null) {
      str += curr.data;

      curr = curr.next;
    }

    return str;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {};
export const filterActionResolvedPromiseData = (input: any, filter1: boolean, filter2: boolean) => {
  if (!!input.language && filter1) {
    //sometimes the language can be null but we've already seen it
    return input;
  } else if (filter1 && filter2) {
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

export const useMergedCallbackRef = (...callbacks: Function[]) => {
  // Storing callbacks in a ref, so that we don't need to memoise them in
  // renders when using this hook.
  const callbacksRegistry = useRef<Function[]>(callbacks);

  useEffect(() => {
    callbacksRegistry.current = callbacks;
  }, [...callbacks]);

  return useCallback((element) => {
    callbacksRegistry.current.forEach((callback) => callback(element));
  }, []);
};

export function useIsMounted(): () => boolean {
  const ref = useRef(false);

  useEffect(() => {
    ref.current = true;
    return () => {
      ref.current = false;
    };
  }, []);

  return () => ref.current;
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
    return await RSSSource.fetchMetaData(source);
  } catch (e) {
    console.log('error');
    throw e;
  }
}

export function logoutAction(history: any, dispatch: React.Dispatch<IAction<ActionShared>>) {
  history.push('/');
  removeTokenGQL().then(noop);
  dispatch({ type: 'LOGOUT' });
  window.location.reload(false); // full refresh to reset everything at all components
}
