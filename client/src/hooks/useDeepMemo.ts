import { useRef } from 'react';
import { isEqualObjects } from '../util';

export function useDeepMemo(memoFn: (...args: any) => Record<string, any>, key: any) {
  const ref = useRef<any>();
  if (!ref.current || !isEqualObjects(key, ref.current.key)) {
    ref.current = { key, value: memoFn() };
  }

  return ref.current.value;
}
