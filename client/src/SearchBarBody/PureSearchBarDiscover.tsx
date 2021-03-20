import React, { useEffect, useRef } from 'react';
import SearchBarLayout from '../Layout/SearchBarLayout';
import { PureInputDiscover } from './PureInputDiscover';
import { SearchBarProps } from '../SearchBarDiscover';
import { isEqualObjects } from '../util';
import { getElasticSearchBert } from '../services';

const SearchBarDiscover = React.memo<SearchBarProps>(
  ({ state, dispatch }) => {
    const size = {
      width: '500px',
      minWidth: '100px',
      maxWidth: '100%',
    };
    let style: React.CSSProperties;
    if (state.width < 711) {
      style = { width: `${state.width - 200}px` };
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
        //TODO: use ElasticSearch autocomplete with highlight text
        dispatch({
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
      <SearchBarLayout style={{ width: `${state.width}px` }} onSubmit={handleSubmit}>
        {() => (
          <React.Fragment>
            <PureInputDiscover style={style} dispatch={dispatch} ref={query} />
          </React.Fragment>
        )}
      </SearchBarLayout>
    );
  },
  (prevProps: any, nextProps: any) => {
    return isEqualObjects(prevProps.state.width, nextProps.state.width);
  }
);
SearchBarDiscover.displayName = 'SearchBarDiscover';
export default SearchBarDiscover;
