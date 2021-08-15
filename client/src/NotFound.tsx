import React from 'react';
import { useTrackedStateShared } from './selectors/stateContextSelector';
import { useLocation } from 'react-router-dom';
import KeepMountedLayout from './Layout/KeepMountedLayout';
import './Not-Found.scss';
import NotFoundLayout from './Layout/NotFoundLayout';

const NotFoundRender = () => {
  const location = useLocation<Location>();
  const [stateShared] = useTrackedStateShared();
  return (
    <KeepMountedLayout
      mountedCondition={
        !/detail/.test(location.pathname) || !/\/|\/profile|\/discover|\/login|\/detail\/^\d+$/.test(location.pathname)
      }
      render={() => {
        return <NotFoundLayout drawerWidth={stateShared.drawerWidth} />;
      }}
    />
  );
};
export default NotFoundRender;
