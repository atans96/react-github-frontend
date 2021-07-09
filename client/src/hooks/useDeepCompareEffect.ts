import { deepEqual } from 'fast-equals';
import { useRef, useEffect } from 'react';
type UseEffectParams = Parameters<typeof useEffect>;
type EffectCallback = UseEffectParams[0];
type DependencyList = UseEffectParams[1];
// yes, I know it's void, but I like what this communicates about
// the intent of these functions: It's just like useEffect
type UseEffectReturn = ReturnType<typeof useEffect>;

function checkDeps(deps: DependencyList) {
  if (!deps || !deps.length) {
    throw new Error('useDeepCompareEffect should not be used with no dependencies. Use useEffect instead.');
  }
  if (deps.every(isPrimitive)) {
    throw new Error(
      'useDeepCompareEffect should not be used with dependencies that are all primitive values. Use useEffect instead.'
    );
  }
}

function isPrimitive(val: unknown) {
  return val == null || /^[sbn]/.test(typeof val);
}

function useDeepCompareMemoize(value: DependencyList) {
  const ref = useRef<DependencyList>();

  if (!deepEqual(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}

function useDeepCompareEffect(callback: EffectCallback, dependencies: DependencyList): UseEffectReturn {
  if (process.env.NODE_ENV !== 'production') {
    checkDeps(dependencies);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, useDeepCompareMemoize(dependencies));
}

export function useDeepCompareEffectNoCheck(callback: EffectCallback, dependencies: DependencyList): UseEffectReturn {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, useDeepCompareMemoize(dependencies));
}

export default useDeepCompareEffect;
