import React, { useEffect, useRef } from 'react';
import { useTrackedStateShared } from './selectors/stateContextSelector';
import Loadable from 'react-loadable';
import Empty from './Layout/EmptyLayout';
import { createStore } from './util/hooksy';

const PureSearchBar = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "PureSearchBar" */ './SearchBarBody/PureSearchBar'),
});
const defaultVisible = false;
const defaulQueryUsername = '';
const defaultVisibleSearchesHistory = false;
export const [useVisible] = createStore(defaultVisible);
export const [useVisibleSearchesHistory] = createStore(defaultVisibleSearchesHistory);
export const [useQueryUsername] = createStore(defaulQueryUsername);

const SearchBar = () => {
  //TODO: https://github.com/moroshko/react-autosuggest
  const [stateShared] = useTrackedStateShared();
  const portalExpandable = useRef<any>();

  return (
    //  use display: grid so that when PureSearchBar is expanded with its multi-select, the div of this parent
    //won't move to the top direction. It will stay as it is while the Search Bar is expanding to the bottom
    <div
      style={{
        display: 'grid',
        justifyContent: 'center',
      }}
    >
      <div className="title-horizontal-center" style={{ width: `${stateShared.width}px` }}>
        <h1>Github Fetcher Dashboard</h1>
      </div>
      <PureSearchBar portalExpandable={portalExpandable} />
      <div className="portal-expandable" ref={portalExpandable} style={{ width: `${stateShared.width}px` }} />
    </div>
  );
};
SearchBar.displayName = 'SearchBar';
export default SearchBar;
