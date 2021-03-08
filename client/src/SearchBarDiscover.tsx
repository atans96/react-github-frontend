import React, { useCallback } from 'react';
import { IState } from './typing/interface';
import PureSearchBarDiscover from './SearchBarBody/PureSearchBarDiscover';

interface SearchBarProps {
  state: IState;
}

const SearchBarDiscover: React.FC<SearchBarProps> = ({ state }) => {
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
      <PureSearchBarDiscover state={PureSearchBarDataMemoized()} />
    </div>
  );
};
export default SearchBarDiscover;
