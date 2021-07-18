import React from 'react';
import useDeepCompareEffect from './hooks/useDeepCompareEffect';
import { useLocation } from 'react-router-dom';
import Loadable from 'react-loadable';
import Empty from './Layout/EmptyLayout';
import { DiscoverStore } from './store/Discover/reducer';

const PureSearchBarDiscover = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "PureSearchBarDiscover" */ './SearchBarBody/PureSearchBarDiscover'),
});
const SearchBarDiscover = React.memo(() => {
  const { filterMergedDataDiscover } = DiscoverStore.store().FilterMergedDataDiscover();
  const location = useLocation();
  useDeepCompareEffect(() => {
    let isFinished = false;
    if (filterMergedDataDiscover.length > 0 && location.pathname === '/discover' && !isFinished) {
      DiscoverStore.dispatch({
        type: 'MERGED_DATA_ADDED_DISCOVER',
        payload: {
          data: [],
          notificationDiscover: '',
        },
      });
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMergedDataDiscover]);

  return (
    //  use display: grid so that when PureSearchBar is expanded with its multi-select, the div of this parent
    //won't move to the top direction. It will stay as it is while the Search Bar is expanding to the bottom
    <div
      style={{
        marginLeft: `0px`,
        display: 'grid',
        marginTop: '10rem',
      }}
    >
      <PureSearchBarDiscover />
    </div>
  );
});
SearchBarDiscover.displayName = 'SearchBarDiscover';
export default SearchBarDiscover;
