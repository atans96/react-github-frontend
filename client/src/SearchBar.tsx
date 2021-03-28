import React, { useCallback, useRef } from 'react';
import PureSearchBar from './SearchBarBody/PureSearchBar';
import { IAction, IState, IStateShared, IStateStargazers } from './typing/interface';
import { Action } from './store/reducer';
import { ActionStargazers } from './store/Staargazers/reducer';
import { ActionShared } from './store/Shared/reducer';

interface SearchBarProps {
  state: IState;
  stateShared: IStateShared;
  dispatchStargazers: React.Dispatch<IAction<ActionStargazers>>;
  dispatch: React.Dispatch<IAction<Action>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
  stateStargazers: IStateStargazers;
}

const SearchBar: React.FC<SearchBarProps> = ({
  state,
  stateShared,
  stateStargazers,
  dispatchStargazers,
  dispatchShared,
  dispatch,
}) => {
  const PureSearchBarDataMemoized = useCallback(() => {
    return { state, stateShared, stateStargazers };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stateShared.width,
    stateShared.perPage,
    state.filteredTopics,
    state.mergedData,
    state.filteredMergedData,
    state.topics,
    state.searchUsers,
    state.isLoading,
    state.filterBySeen,
    state.visible,
    stateShared.isLoggedIn,
    stateStargazers.stargazersQueueData,
  ]);

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
      <PureSearchBar
        portalExpandable={portalExpandable}
        dispatch={dispatch}
        state={PureSearchBarDataMemoized()}
        dispatchStargazers={dispatchStargazers}
        dispatchShared={dispatchShared}
      />
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
