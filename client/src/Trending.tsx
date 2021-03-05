import React from 'react';
import { IState, IStateStargazers } from './typing/interface';
import { RouteComponentProps } from 'react-router-dom';
interface TrendingProps {
  state: IState;
  stateStargazers: IStateStargazers;
  dispatch: any;
  dispatchStargazers: any;
  routerProps: RouteComponentProps<{}, {}, {}>;
}

const Trending = React.memo<TrendingProps>(({ state, dispatch, dispatchStargazers, stateStargazers, routerProps }) => {
  return <p>Hi</p>;
});
export default Trending;
