import React, { useRef } from 'react';
import SearchBarLayout from '../Layout/SearchBarLayout';
import { getElasticSearchBert } from '../services';
import { useTrackedStateDiscover } from '../selectors/stateContextSelector';
import Loadable from 'react-loadable';
import Empty from '../Layout/EmptyLayout';

const PureInputDiscover = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "PureInputDiscover" */ './PureInputDiscover'),
});

export interface SearchBarProps {
  width: number;
}

const SearchBarDiscover: React.FC<SearchBarProps> = ({ width }) => {
  const [, dispatchDiscover] = useTrackedStateDiscover();
  const size = {
    width: '500px',
    minWidth: '100px',
    maxWidth: '100%',
  };
  let style: React.CSSProperties;
  if (width < 711) {
    style = { width: `${width - 200}px` };
  } else {
    style = {
      maxWidth: size.maxWidth,
      width: size.width,
      minWidth: size.minWidth,
    };
  }
  const query = useRef<any>();
  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    getElasticSearchBert(query?.current?.getState()).then((res) => {
      dispatchDiscover({
        type: 'MERGED_DATA_ADDED_DISCOVER',
        payload: {
          data: res,
          notificationDiscover: res.length === 0 ? `No data found for query: ${query?.current?.getState()}` : '',
        },
      });
      query.current.clearState();
    });
  };
  return (
    <SearchBarLayout style={{ width: `${width}px` }} onSubmit={handleSubmit}>
      {() => (
        <React.Fragment>
          <PureInputDiscover style={style} dispatchDiscover={dispatchDiscover} ref={query} />
        </React.Fragment>
      )}
    </SearchBarLayout>
  );
};
SearchBarDiscover.displayName = 'SearchBarDiscover';
export default SearchBarDiscover;
