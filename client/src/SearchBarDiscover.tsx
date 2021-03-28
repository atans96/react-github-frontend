import React, { useCallback } from 'react';
import { IAction, IStateDiscover, IStateShared } from './typing/interface';
import PureSearchBarDiscover from './SearchBarBody/PureSearchBarDiscover';
import { ActionDiscover } from './store/Discover/reducer';
import useDeepCompareEffect from './hooks/useDeepCompareEffect';

export interface SearchBarProps {
  stateShared: IStateShared;
  stateDiscover: IStateDiscover;
  dispatchDiscover: React.Dispatch<IAction<ActionDiscover>>;
}

const SearchBarDiscover: React.FC<SearchBarProps> = ({ stateShared, stateDiscover, dispatchDiscover }) => {
  const PureSearchBarDataMemoized = useCallback(() => {
    return stateShared;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateShared.width]);
  useDeepCompareEffect(() => {
    if (stateDiscover.filterMergedDataDiscover.length > 0) {
      dispatchDiscover({
        type: 'MERGED_DATA_ADDED_DISCOVER',
        payload: {
          data: [],
          notificationDiscover: '',
        },
      });
    }
  }, [stateDiscover.filterMergedDataDiscover]);
  return (
    //  use display: grid so that when PureSearchBar is expanded with its multi-select, the div of this parent
    //won't move to the top direction. It will stay as it is while the Search Bar is expanding to the bottom
    <div
      style={{
        marginLeft: `${stateShared.drawerWidth > 60 ? stateShared.drawerWidth : 0}px`,
        display: 'grid',
      }}
    >
      <PureSearchBarDiscover stateShared={PureSearchBarDataMemoized()} dispatchDiscover={dispatchDiscover} />
    </div>
  );
};
SearchBarDiscover.displayName = 'SearchBarDiscover';
export default SearchBarDiscover;
