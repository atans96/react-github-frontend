import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { allowedRoutes } from './util';
import KeepMountedLayout from './Layout/KeepMountedLayout';
import './Not-Found.scss';
import { SharedStore } from './store/Shared/reducer';
const NotFound = React.memo(({ drawerWidth = 0 }: any) => {
  return (
    //  use display: grid so that when PureNotFound is expanded with its multi-select, the div of this parent
    //won't move to the top direction. It will stay as it is while the Search Bar is expanding to the bottom
    <div
      style={{
        marginLeft: `${drawerWidth > 60 ? `${drawerWidth}px` : `${5}rem`}`,
        display: 'grid',
        marginTop: '30rem',
        textAlign: 'center',
      }}
      className={'not-found'}
    >
      <h3 className={'google'}>
        4<span style={{ color: 'gray' }}>0</span>4
      </h3>
      <h3 className={'texts'}>Oops, something went wrong...</h3>
      <h3 style={{ marginBottom: '30px', fontSize: '1.5em' }}>The page you are looking for is not here</h3>
      <NavLink style={{ color: 'black' }} to={{ pathname: '/' }}>
        <h3>GO BACK TO HOME</h3>
      </NavLink>
    </div>
  );
});
NotFound.displayName = 'NotFound';
const NotFoundRender = () => {
  const location = useLocation<Location>();
  const { drawerWidth } = SharedStore.store().DrawerWidth();
  return (
    <KeepMountedLayout
      mountedCondition={!/detail/.test(location.pathname) || !allowedRoutes.includes(location.pathname)}
      render={() => {
        return <NotFound drawerWidth={drawerWidth} />;
      }}
    />
  );
};
export default NotFoundRender;
