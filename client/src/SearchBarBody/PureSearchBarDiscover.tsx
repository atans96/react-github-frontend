import React, { useRef } from 'react';
import SearchBarLayout from '../Layout/SearchBarLayout';
import { IState } from '../typing/interface';
import { PureInputDiscover } from './PureInputDiscover';
import { getElasticSearchBert } from '../services';

interface SearchBarDiscoverProps {
  state: IState;
}

const SearchBarDiscover = React.memo<SearchBarDiscoverProps>(({ state }) => {
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
  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    getElasticSearchBert(query?.current?.getState()).then((res) => {
      console.log(res);
      //TODO: display the filtered cards
      //TODO: when waiting
      query?.current?.clearState();
    });
  };

  return (
    <SearchBarLayout style={{ width: `${state.width} px` }} onSubmit={handleSubmit}>
      {(portal) => (
        <React.Fragment>
          <PureInputDiscover style={style} ref={query} />
        </React.Fragment>
      )}
    </SearchBarLayout>
  );
});
export default SearchBarDiscover;
