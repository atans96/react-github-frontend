import { useLocation } from 'react-router-dom';
import React, { useRef } from 'react';
import KeepMountedLayout from './Layout/KeepMountedLayout';
import { StateRateLimitProvider } from './selectors/stateContextSelector';
import { createRenderElement } from './Layout/MasonryLayout';
import { loadable } from './loadable';
const Login = (condition: boolean, args: { location: string }) =>
  loadable({
    importFn: () => import('./Login').then((module) => createRenderElement(module.default, { ...args })),
    cacheId: 'Login',
    condition: condition,
    empty: () => <></>,
  });
const LoginRender = () => {
  const location = useLocation();
  const locationRef = useRef(location.pathname);
  return (
    <KeepMountedLayout
      mountedCondition={location.pathname === '/login'}
      render={() => {
        return (
          <StateRateLimitProvider>
            {Login(location.pathname === '/login', { location: locationRef.current })}
          </StateRateLimitProvider>
        );
      }}
    />
  );
};
LoginRender.displayName = 'Login';
export default LoginRender;
