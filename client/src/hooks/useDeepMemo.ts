import { equal } from '@wry/equality';
import { useRef } from 'react';

export function useDeepMemo(memoFn: () => {}, key: any) {
  const ref = useRef<any>();
  if (!ref.current || !equal(key, ref.current.key)) {
    ref.current = { key, value: memoFn() };
  }

  return ref.current.value;
}
