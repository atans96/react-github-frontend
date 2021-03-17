import React, { useCallback } from 'react';
import { IDataOne, IState } from './typing/interface';
import PureSearchBarDiscover from './SearchBarBody/PureSearchBarDiscover';
import { Action, Nullable } from './typing/type';
interface Output {
  isFetchFinish: boolean;
}
export interface SearchBarProps {
  state: IState;
  dispatch: any;
  actionResolvedPromise: (
    action: Action,
    setLoading: any,
    setNotification: any,
    isFetchFinish: boolean,
    displayName: string,
    data?: Nullable<IDataOne | any>,
    error?: string
  ) => Output;
}

const SearchBarDiscover: React.FC<SearchBarProps> = ({ state, dispatch, actionResolvedPromise }) => {
  const PureSearchBarDataMemoized = useCallback(() => {
    return state;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.width]);
  return (
    //  use display: grid so that when PureSearchBar is expanded with its multi-select, the div of this parent
    //won't move to the top direction. It will stay as it is while the Search Bar is expanding to the bottom
    <div
      style={{
        marginLeft: `${state.drawerWidth > 60 && document.location.pathname === '/discover' ? state.drawerWidth : 0}px`,
        display: 'grid',
      }}
    >
      <PureSearchBarDiscover
        state={PureSearchBarDataMemoized()}
        dispatch={dispatch}
        actionResolvedPromise={actionResolvedPromise}
      />
    </div>
  );
};
SearchBarDiscover.displayName = 'SearchBarDiscover';
export default SearchBarDiscover;
