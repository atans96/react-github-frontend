import React, { useRef } from 'react';
import SearchBarLayout from '../Layout/SearchBarLayout';
import { getElasticSearchBert } from '../services';
import { IStateShared } from '../typing/interface';
import { useTrackedStateDiscover } from '../selectors/stateContextSelector';
import { createRenderElement } from '../Layout/MasonryLayout';
import { loadable } from '../loadable';

const PureInputDiscover = (args: {
  ref: React.MutableRefObject<any | undefined>;
  dispatchDiscover: any;
  style: React.CSSProperties;
}) =>
  loadable({
    importFn: () => import('./PureInputDiscover').then((module) => createRenderElement(module.default, { ...args })),
    cacheId: 'PureInputDiscover',
    empty: () => <></>,
  });

export interface SearchBarProps {
  stateShared: IStateShared;
}

const SearchBarDiscover: React.FC<SearchBarProps> = ({ stateShared }) => {
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
      {() => <React.Fragment>{PureInputDiscover({ style, dispatchDiscover, ref: query })}</React.Fragment>}
    </SearchBarLayout>
  );
};
SearchBarDiscover.displayName = 'SearchBarDiscover';
export default SearchBarDiscover;
