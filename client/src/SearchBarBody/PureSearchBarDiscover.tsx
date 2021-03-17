import React, { useRef } from 'react';
import SearchBarLayout from '../Layout/SearchBarLayout';
import { PureInputDiscover } from './PureInputDiscover';
import { getElasticSearchBert } from '../services';
import { SearchBarProps } from '../SearchBarDiscover';
import { Action } from '../typing/type';

const SearchBarDiscover = React.memo<SearchBarProps>(({ state, dispatch, actionResolvedPromise }) => {
  const size = {
    width: '500px',
    minWidth: '100px',
    maxWidth: '100%',
  };
  const query = useRef<any>();
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
  const displayName: string | undefined = (SearchBarDiscover as React.ComponentType<any>).displayName;
  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    dispatch({
      type: 'MERGED_DATA_ADDED_DISCOVER',
      payload: {
        data: [],
        notificationDiscover: '',
        isLoadingDiscover: true,
      },
    });
    getElasticSearchBert(query?.current?.getState()).then((res) => {
      //TODO: when waiting
      //TODO: after search, disable handleBottomHit functionality so that it won't fetchMore
      dispatch({
        type: 'MERGED_DATA_ADDED_DISCOVER',
        payload: {
          data: res,
          notificationDiscover: res.length === 0 ? `No data found for query ${query.current.getState()}` : '',
          isLoadingDiscover: false,
        },
      });
      query.current.clearState();
      actionResolvedPromise(
        res.length > 0 ? Action.nonAppend : Action.noData,
        (e: any) => {
          console.debug('');
        },
        (e: any) => {
          console.debug('');
        },
        false,
        displayName!,
        res
      );
    });
  };

  return (
    <SearchBarLayout style={{ width: `${state.width}px` }} onSubmit={handleSubmit}>
      {() => (
        <React.Fragment>
          <PureInputDiscover style={style} ref={query} />
        </React.Fragment>
      )}
    </SearchBarLayout>
  );
});
SearchBarDiscover.displayName = 'SearchBarDiscover';
export default SearchBarDiscover;
