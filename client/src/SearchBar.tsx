import React, { useCallback, useRef } from 'react';
import PureSearchBar from './SearchBarBody/PureSearchBar';
import { IState, IStateStargazers } from './typing/interface';

interface SearchBarProps {
  state: IState;
  dispatch: any;
  stateStargazers: IStateStargazers;
  dispatchStargazers: any;
}

const SearchBar: React.FC<SearchBarProps> = ({ state, stateStargazers, dispatchStargazers, dispatch }) => {
  const PureSearchBarDataMemoized = useCallback(() => {
    return state;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.width,
    state.perPage,
    state.filteredTopics,
    state.mergedData,
    state.filteredMergedData,
    state.topics,
    state.searchUsers,
    state.isLoading,
    state.filterBySeen,
    state.visible,
    state.isLoggedIn,
  ]);
  const PureSearchBarDataMemoizedd = useCallback(() => {
    return stateStargazers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateStargazers.stargazersQueueData]);
  const portalExpandable = useRef<any>();
  return (
    //  use display: grid so that when PureSearchBar is expanded with its multi-select, the div of this parent
    //won't move to the top direction. It will stay as it is while the Search Bar is expanding to the bottom
    <div
      style={{
        marginLeft: `${state.drawerWidth > 60 && document.location.pathname === '/' ? state.drawerWidth : 0}px`,
        display: 'grid',
      }}
    >
      <div className="title-horizontal-center" style={{ width: `${state.width} px` }}>
        <h1>Github Fetcher Dashboard</h1>
      </div>
      <PureSearchBar
        portalExpandable={portalExpandable}
        dispatch={dispatch}
        state={PureSearchBarDataMemoized()}
        stateStargazers={PureSearchBarDataMemoizedd()}
        dispatchStargazersUser={dispatchStargazers}
      />
      <div
        className="portal-expandable"
        ref={portalExpandable}
        style={{ width: `${state.width} px`, marginLeft: `${state.drawerWidth + 5}px` }}
      />
    </div>
  );
};
export default SearchBar;
