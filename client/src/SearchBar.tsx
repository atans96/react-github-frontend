import React, { useRef } from 'react';
import Loadable from 'react-loadable';
import Empty from './Layout/EmptyLayout';
import { SharedStore } from './store/Shared/reducer';

const PureSearchBar = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "PureSearchBar" */ './SearchBarBody/PureSearchBar'),
});
const SearchBar = React.memo(() => {
  const { drawerWidth } = SharedStore.store().DrawerWidth();
  const { width } = SharedStore.store().Width();
  const portalExpandable = useRef<any>();
  return (
    //  use display: grid so that when PureSearchBar is expanded with its multi-select, the div of this parent
    //won't move to the top direction. It will stay as it is while the Search Bar is expanding to the bottom
    <div
      style={{
        marginLeft: `${drawerWidth > 60 ? `${drawerWidth}px` : `${5}rem`}`,
        display: 'grid',
        justifyContent: 'center',
      }}
    >
      <div className="title-horizontal-center" style={{ width: `${width}px` }}>
        <h1>Github Fetcher Dashboard</h1>
      </div>
      <PureSearchBar portalExpandable={portalExpandable} />
      <div
        className="portal-expandable"
        ref={portalExpandable}
        style={
          drawerWidth === 0
            ? { width: `${width - 100}px`, marginLeft: `5px` }
            : { width: `${width - 100}px`, marginLeft: `5px`, paddingRight: '120px' }
        }
      />
    </div>
  );
});
SearchBar.displayName = 'SearchBar';
export default SearchBar;
