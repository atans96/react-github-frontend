import React from 'react';
import { useTrackedStateShared } from './selectors/stateContextSelector';

const NotFound = () => {
  const [stateShared] = useTrackedStateShared();
  return (
    //  use display: grid so that when PureNotFound is expanded with its multi-select, the div of this parent
    //won't move to the top direction. It will stay as it is while the Search Bar is expanding to the bottom
    <div
      style={{
        marginLeft: `${stateShared.drawerWidth > 60 ? `${stateShared.drawerWidth}px` : `${5}rem`}`,
        display: 'grid',
        marginTop: '10rem',
      }}
    >
      <h3>404 not found</h3>
    </div>
  );
};
NotFound.displayName = 'NotFound';
export default NotFound;
