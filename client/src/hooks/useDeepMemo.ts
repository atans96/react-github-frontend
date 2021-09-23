import { useRef } from 'react';
import { deepEqual } from 'fast-equals';

export function useDeepMemo(memoFn: (...args: any) => Record<string, any> | any, key: any) {
  const ref = useRef<any>();
  if (!ref.current || !deepEqual(key, ref.current.key)) {
    ref.current = { key, value: memoFn() };
  }

  return ref.current.value;
}
