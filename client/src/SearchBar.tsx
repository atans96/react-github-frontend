import React, { useRef } from 'react';
import { useTrackedStateShared } from './selectors/stateContextSelector';
import { loadable } from './loadable';
import { createRenderElement } from './Layout/MasonryLayout';

const PureSearchBar = (args: { portalExpandable: any }) =>
  loadable({
    importFn: () =>
      import('./SearchBarBody/PureSearchBar').then((module) => createRenderElement(module.default, { ...args })),
    cacheId: 'PureSearchBar',
    empty: () => <></>,
  });
const SearchBar = () => {
  const [stateShared] = useTrackedStateShared();
  const portalExpandable = useRef<any>();
  return (
    //  use display: grid so that when PureSearchBar is expanded with its multi-select, the div of this parent
    //won't move to the top direction. It will stay as it is while the Search Bar is expanding to the bottom
    <div
      style={{
        marginLeft: `${stateShared.drawerWidth > 60 ? `${stateShared.drawerWidth}px` : `${5}rem`}`,
        display: 'grid',
        marginTop: '10rem',
      }}
    >
      <div className="title-horizontal-center" style={{ width: `${stateShared.width}px` }}>
        <h1>Github Fetcher Dashboard</h1>
      </div>
      {PureSearchBar({ portalExpandable })}
      <div
        className="portal-expandable"
        ref={portalExpandable}
        style={
          stateShared.drawerWidth === 0
            ? { width: `${stateShared.width - 100}px`, marginLeft: `5px` }
            : { width: `${stateShared.width - 100}px`, marginLeft: `5px`, paddingRight: '120px' }
        }
      />
    </div>
  );
};
SearchBar.displayName = 'SearchBar';
export default SearchBar;
