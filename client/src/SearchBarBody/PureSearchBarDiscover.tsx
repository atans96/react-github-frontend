import React, { useRef } from 'react';
import SearchBarLayout from '../Layout/SearchBarLayout';
import { PureInputDiscover } from './PureInputDiscover';
import { isEqualObjects } from '../util';
import { getElasticSearchBert } from '../services';
import { IStateShared } from '../typing/interface';
import { useTrackedStateDiscover } from '../selectors/stateContextSelector';

export interface SearchBarProps {
  stateShared: IStateShared;
}

const SearchBarDiscover = React.memo<SearchBarProps>(
  ({ stateShared }) => {
    const [, dispatchDiscover] = useTrackedStateDiscover();
    const size = {
      width: '500px',
      minWidth: '100px',
      maxWidth: '100%',
    };
    let style: React.CSSProperties;
    if (stateShared.width < 711) {
      style = { width: `${stateShared.width - 200}px` };
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
      <SearchBarLayout style={{ width: `${stateShared.width}px` }} onSubmit={handleSubmit}>
        {() => (
          <React.Fragment>
            <PureInputDiscover style={style} dispatchDiscover={dispatchDiscover} ref={query} />
          </React.Fragment>
        )}
      </SearchBarLayout>
    );
  },
  (prevProps: any, nextProps: any) => {
    return isEqualObjects(prevProps.stateShared.width, nextProps.stateShared.width);
  }
);
SearchBarDiscover.displayName = 'SearchBarDiscover';
export default SearchBarDiscover;
