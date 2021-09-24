import React, { useEffect, useRef } from 'react';
import useDeepCompareEffect from '../hooks/useDeepCompareEffect';
import { useTrackedStateDiscover, useTrackedStateShared } from '../selectors/stateContextSelector';
import { useLocation } from 'react-router-dom';
import Loadable from 'react-loadable';
import { useStableCallback } from '../util';
import Empty from './Layout/EmptyLayout';

const PureSearchBarDiscover = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "PureSearchBarDiscover" */ './SearchBarBody/PureSearchBarDiscover'),
});
const SearchBarDiscover = () => {
  const [stateShared] = useTrackedStateShared();
  const [stateDiscover, dispatchDiscover] = useTrackedStateDiscover();
  const PureSearchBarDataMemoized = useStableCallback(() => {
    return stateShared.width;
  });

  const location = useLocation();
  const isFinished = useRef(false);

  useEffect(() => {
    return () => {
      isFinished.current = true;
    };
  }, []);

  useDeepCompareEffect(() => {
    if (stateDiscover.filterMergedDataDiscover.length > 0 && location.pathname === '/discover' && !isFinished.current) {
      dispatchDiscover({
        type: 'MERGED_DATA_ADDED_DISCOVER',
        payload: {
          data: [],
          notificationDiscover: '',
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateDiscover.filterMergedDataDiscover]);

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
      <PureSearchBarDiscover width={PureSearchBarDataMemoized()} />
    </div>
  );
};
SearchBarDiscover.displayName = 'SearchBarDiscover';
export default React.memo(SearchBarDiscover);
