import React, { useRef } from 'react';
import PureSearchBar from './SearchBarBody/PureSearchBar';
import { useTrackedStateShared } from './selectors/stateContextSelector';

const SearchBar = () => {
  const [stateShared] = useTrackedStateShared();
  const portalExpandable = useRef<any>();
  return (
    //  use display: grid so that when PureSearchBar is expanded with its multi-select, the div of this parent
    //won't move to the top direction. It will stay as it is while the Search Bar is expanding to the bottom
    <div
      style={{
        marginLeft: `${stateShared.drawerWidth > 60 ? stateShared.drawerWidth : 0}px`,
        display: 'grid',
      }}
    >
      <div className="title-horizontal-center" style={{ width: `${stateShared.width}px` }}>
        <h1>Github Fetcher Dashboard</h1>
      </div>
      <PureSearchBar portalExpandable={portalExpandable} />
      <div
        className="portal-expandable"
        ref={portalExpandable}
        style={{ width: `${stateShared.width}px`, marginLeft: `${stateShared.drawerWidth + 5}px` }}
      />
    </div>
  );
};
SearchBar.displayName = 'SearchBar';
export default SearchBar;
