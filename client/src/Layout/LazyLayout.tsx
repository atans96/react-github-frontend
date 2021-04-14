import React from 'react';
import { noop } from '../util/util';

export type LazyProps = {
  component: React.LazyExoticComponent<() => JSX.Element>;
  initialFallback?: JSX.Element;
};

export const Lazy = ({ component, initialFallback = <></> }: LazyProps): JSX.Element => {
  const fallback = React.useRef(() => initialFallback);
  const Component = component;

  const updateFallback = async (): Promise<void> => {
    const result = await component._result;
    fallback.current = typeof result === 'function' ? result : (result as any).default;
  };

  React.useEffect(() => {
    updateFallback().then(noop);
  }, [component]);

  return (
    <React.Suspense fallback={<fallback.current />}>
      <Component />
    </React.Suspense>
  );
};
