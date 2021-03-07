import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Login from './Login';
import ManageProfile from './ManageProfile';
import Home from './Home';
import KeepMountedLayout from './Layout/KeepMountedLayout';
import { Then } from './util/react-if/Then';
import { If } from './util/react-if/If';
import Details from './Details';
import { IState, IStateStargazers } from './typing/interface';
import SearchBar from './SearchBar';
import { getTokenGQL } from './services';
import Discover from './Discover';
import Trending from './Trending';
import PrefetchKeepMountedLayout from './Layout/PrefetchKeepMountedLayout';
import SearchBarDiscover from './SearchBarDiscover';
import useUserVerification from './hooks/useUserVerification';

interface GlobalProps {
  state: IState;
  stateStargazers: IStateStargazers;
  dispatch: any;
  dispatchStargazers: any;
}
const Global: React.FC<{
  routerProps: RouteComponentProps<any, any, any>;
  componentProps: GlobalProps;
}> = (props) => {
  const { verifiedLoading, username } = useUserVerification(props);
  useEffect(() => {
    if (!props.componentProps.state.isLoggedIn) {
      props.componentProps.dispatch({
        type: 'LOGIN',
        payload: {
          isLoggedIn: !verifiedLoading && username !== '',
        },
      });
    }
    if (!verifiedLoading && username !== '') {
      getTokenGQL().then((res) => {
        if (res.tokenGQL) {
          props.componentProps.dispatch({
            type: 'TOKEN_ADDED',
            payload: {
              tokenGQL: res.tokenGQL,
            },
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedLoading, username, props.componentProps.state.isLoggedIn, props.componentProps.state.tokenGQL]);
  return (
    <React.Fragment>
      <KeepMountedLayout
        mountedCondition={props.routerProps.location.pathname === '/'}
        render={() => {
          return (
            <React.Fragment>
              <SearchBar
                state={props.componentProps.state}
                stateStargazers={props.componentProps.stateStargazers}
                dispatch={props.componentProps.dispatch}
                dispatchStargazers={props.componentProps.dispatchStargazers}
              />
              <Home
                stateStargazers={props.componentProps.stateStargazers}
                dispatchStargazers={props.componentProps.dispatchStargazers}
                dispatch={props.componentProps.dispatch}
                state={props.componentProps.state}
                routerProps={props.routerProps}
              />
            </React.Fragment>
          );
        }}
      />
      <PrefetchKeepMountedLayout
        mountedCondition={props.routerProps.location.pathname === '/discover'}
        render={() => {
          return (
            <React.Fragment>
              <SearchBarDiscover state={props.componentProps.state} />
              <Discover
                dispatchStargazers={props.componentProps.dispatchStargazers}
                dispatch={props.componentProps.dispatch}
                state={props.componentProps.state}
                routerProps={props.routerProps}
              />
            </React.Fragment>
          );
        }}
      />
      <PrefetchKeepMountedLayout
        mountedCondition={props.routerProps.location.pathname === '/trending'}
        render={() => {
          return (
            <Trending
              stateStargazers={props.componentProps.stateStargazers}
              dispatchStargazers={props.componentProps.dispatchStargazers}
              dispatch={props.componentProps.dispatch}
              state={props.componentProps.state}
              routerProps={props.routerProps}
            />
          );
        }}
      />
      <If condition={props.routerProps.location.pathname === '/login'}>
        <Then>
          <Login />
        </Then>
      </If>

      <PrefetchKeepMountedLayout
        mountedCondition={props.routerProps.location.pathname === '/profile'}
        render={() => {
          return <ManageProfile dispatch={props.componentProps.dispatch} state={props.componentProps.state} />;
        }}
      />
      <If condition={props.routerProps.location.pathname.includes('/detail')}>
        <Then>
          <Details />
        </Then>
      </If>
    </React.Fragment>
  );
};
export default Global;
