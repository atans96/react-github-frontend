import React, { useEffect, useRef } from 'react';
import SearchBarLayout from '../Layout/SearchBarLayout';
import { getElasticSearchBert } from '../../services';
import { useTrackedStateDiscover } from '../../selectors/stateContextSelector';
import PureInputDiscover from './PureInputDiscover';

export interface SearchBarProps {
  width: number;
}

const SearchBarDiscover: React.FC<SearchBarProps> = ({ width }) => {
  const abortController = new AbortController();
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
    getElasticSearchBert(query?.current?.getState(), abortController.signal).then((res) => {
      if (abortController.signal.aborted) {
        return;
      }
      dispatchDiscover({
        type: 'MERGED_DATA_ADDED_DISCOVER',
        payload: {
          data: res,
          notificationDiscover: res?.length === 0 ? `No data found for query: ${query?.current?.getState()}` : '',
        },
      });
      query.current.clearState();
    });
  };
  useEffect(() => {
    return () => {
      abortController.abort();
    };
  }, []);
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
