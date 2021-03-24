import React, { useCallback, useEffect } from 'react';
import { IDataOne, IState } from './typing/interface';
import PureSearchBarDiscover from './SearchBarBody/PureSearchBarDiscover';
import { Action, Nullable } from './typing/type';
export interface SearchBarProps {
  state: IState;
  dispatch: any;
}

const SearchBarDiscover: React.FC<SearchBarProps> = ({ state, dispatch }) => {
  const PureSearchBarDataMemoized = useCallback(() => {
    return state;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.width]);
  useEffect(() => {
    if (document.location.pathname !== '/discover' && state.filterMergedDataDiscover.length > 0) {
      dispatch({
        type: 'MERGED_DATA_ADDED_DISCOVER',
        payload: {
          data: [],
          notificationDiscover: '',
        },
      });
    }
  }, [document.location.pathname]);
  return (
    //  use display: grid so that when PureSearchBar is expanded with its multi-select, the div of this parent
    //won't move to the top direction. It will stay as it is while the Search Bar is expanding to the bottom
    <div
      style={{
        marginLeft: `${state.drawerWidth > 60 && document.location.pathname === '/discover' ? state.drawerWidth : 0}px`,
        display: 'grid',
      }}
    >
      <PureSearchBarDiscover state={PureSearchBarDataMemoized()} dispatch={dispatch} />
    </div>
  );
};
SearchBarDiscover.displayName = 'SearchBarDiscover';
export default SearchBarDiscover;
