import React, { useCallback, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Login from './Login';
import ManageProfile from './ManageProfile';
import Home from './Home';
import KeepMountedLayout from './Layout/KeepMountedLayout';
import { Then } from './util/react-if/Then';
import { If } from './util/react-if/If';
import Details from './Details';
import { IDataOne, IState, IStateStargazers } from './typing/interface';
import SearchBar from './SearchBar';
import { getTokenGQL } from './services';
import Discover from './Discover';
import Trending from './Trending';
import PrefetchKeepMountedLayout from './Layout/PrefetchKeepMountedLayout';
import SearchBarDiscover from './SearchBarDiscover';
import useUserVerification from './hooks/useUserVerification';
import { alreadySeenCardSelector } from './selectors/stateSelector';
import { fastFilter } from './util';
import { filterActionResolvedPromiseData } from './util/util';
import {
  dispatchAppendMergedData,
  dispatchAppendMergedDataDiscover,
  dispatchImagesData,
  dispatchPage,
  dispatchPageDiscover,
} from './store/dispatcher';
import { useApolloFactory } from './hooks/useApolloFactory';
import { Action, LanguagePreference, MergedDataProps, Nullable } from './typing/type';

interface GlobalProps {
  state: IState;
  stateStargazers: IStateStargazers;
  dispatch: any;
  dispatchStargazers: any;
}

//TODO: create code snippet like: https://snipit.io/ or https://github.com/hackjutsu/Lepton
//TODO: refactor dispatcher.ts
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
  const displayName: string | undefined = (Global as React.ComponentType<any>).displayName;
  const { userData, userDataLoading } = useApolloFactory(displayName!).query.getUserData();
  const { userStarred, loadingUserStarred } = useApolloFactory(displayName!).query.getUserInfoStarred();
  const { seenData, seenDataLoading } = useApolloFactory(displayName!).query.getSeen();
  const alreadySeenCards: number[] = React.useMemo(() => {
    //Every time Global re-renders and nothing is memoized because each render re creates the selector.
    // To solve this we can use React.useMemo. Here is the correct way to use createSelectItemById.
    return alreadySeenCardSelector(seenData?.getSeen?.seenCards || []);
  }, [seenData?.getSeen?.seenCards]);

  const languagePreference = React.useMemo(() => {
    return new Map(userData?.getUserData?.languagePreference?.map((obj: LanguagePreference) => [obj.language, obj]));
  }, [userData?.getUserData?.languagePreference]);

  const actionAppend = (data: IDataOne | any, displayName: string) => {
    if (props.componentProps.state.filterBySeen) {
      switch (displayName) {
        case displayName!.match(/^discover/gi)![0] !== null && displayName!.match(/^discover/gi)![0].length > 0
          ? displayName
          : undefined: {
          let filter1 = fastFilter(
            (obj: MergedDataProps) =>
              filterActionResolvedPromiseData(
                obj,
                !alreadySeenCards.includes(obj.id),
                languagePreference.get(obj.language),
                userStarred?.getUserInfoStarred?.starred?.includes(obj.id) === false
              ),
            data
          );
          //Matched a string that starts with 'discover'
          filter1 = fastFilter((obj: MergedDataProps) => !!obj, filter1).map((obj: MergedDataProps) => {
            obj['isQueue'] = false;
            return obj;
          });

          let inputForImagesData = [];
          if (filter1.length > 0) {
            dispatchAppendMergedDataDiscover(filter1, props.componentProps.dispatch);
            inputForImagesData = filter1.reduce((acc: any[], object: MergedDataProps) => {
              acc.push(
                Object.assign(
                  {},
                  {
                    id: object.id,
                    value: {
                      full_name: object.full_name,
                      branch: object.default_branch,
                    },
                  }
                )
              );
              return acc;
            }, []);
          } else if (filter1.length === 0) {
            dispatchPageDiscover(props.componentProps.dispatch);
          }
          break;
        }
        case 'Home': {
          const filter1 = fastFilter(
            (obj: MergedDataProps) =>
              filterActionResolvedPromiseData(
                obj,
                !alreadySeenCards.includes(obj.id),
                languagePreference.get(obj.language)
              ),
            data.dataOne
          );
          const tempImages = fastFilter(
            (obj: MergedDataProps) => !alreadySeenCards.includes(obj.id),
            data.renderImages
          );
          if (tempImages.length === 0) {
            dispatchImagesData([], props.componentProps.dispatch);
          } else {
            dispatchImagesData(tempImages, props.componentProps.dispatch);
          }
          dispatchAppendMergedData(filter1, props.componentProps.dispatch);
          if (filter1.length === 0) {
            dispatchPage(props.componentProps.dispatch);
          } else {
            if (data.renderImages.length === 0) {
              dispatchImagesData([], props.componentProps.dispatch);
            } else {
              dispatchImagesData(data.renderImages, props.componentProps.dispatch);
            }
            const temp = data.dataOne || data;
            temp.map((obj: MergedDataProps) => {
              obj['isQueue'] = false;
              return obj;
            });
            dispatchAppendMergedData(temp, props.componentProps.dispatch);
          }
          break;
        }
        default: {
          console.log(displayName.match(/^discover/gi) || {});
          throw new Error('No valid component found!');
        }
      }
    }
  };
  const actionNonAppend = (data: IDataOne | any, displayName: string) => {
    switch (displayName) {
      case (displayName.match(/^discover/gi) || {}).input: {
      }
    }
  };
  const actionResolvedPromise = useCallback(
    (
      action: Action,
      setLoading: any,
      setNotification: any,
      isFetchFinish: boolean,
      displayName: string,
      data?: Nullable<IDataOne | any>,
      error?: string
    ) => {
      setLoading(false);
      if (data && action === 'nonAppend') {
        actionNonAppend(data, displayName);
      }
      if (data && action === 'append') {
        actionAppend(data, displayName);
      }
      if (action === 'noData') {
        isFetchFinish = true;
        setNotification(`Sorry, no more data found for ${props.componentProps.state.username}`);
      }
      if (action === 'error' && error) {
        throw new Error(`Something wrong at ${displayName} ${error}`);
      }
      if (data && data.error_404) {
        setNotification(`Sorry, no data found for ${props.componentProps.state.username}`);
      } else if (data && data.error_403) {
        setNotification('Sorry, API rate limit exceeded.'); //TODO: display show RateLimit.tsx
      } else if (data && data.error_message) {
        throw new Error(`Something wrong at ${displayName} ${data.error_message}`);
      }
      return { isFetchFinish };
    },
    [alreadySeenCards]
  );

  return (
    <React.Fragment>
      <If condition={seenDataLoading && userDataLoading && loadingUserStarred}>
        <Then>
          <div style={{ textAlign: 'center' }}>
            <div className="loader-xx">Loading...</div>
            <div style={{ textAlign: 'center' }}>
              <h3>Please wait while fetching your data</h3>
            </div>
          </div>
        </Then>
      </If>
      <If condition={!seenDataLoading && !userDataLoading && !loadingUserStarred}>
        <Then>
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
                    actionResolvedPromise={actionResolvedPromise}
                  />
                </React.Fragment>
              );
            }}
          />
          {/*<PrefetchKeepMountedLayout*/}
          {/*  mountedCondition={props.routerProps.location.pathname === '/discover'}*/}
          {/*  render={() => {*/}
          {/*    return (*/}
          {/*      <React.Fragment>*/}
          {/*        <SearchBarDiscover state={props.componentProps.state} dispatch={props.componentProps.dispatch} />*/}
          {/*        <Discover*/}
          {/*          stateStargazers={props.componentProps.stateStargazers}*/}
          {/*          dispatchStargazers={props.componentProps.dispatchStargazers}*/}
          {/*          dispatch={props.componentProps.dispatch}*/}
          {/*          state={props.componentProps.state}*/}
          {/*          routerProps={props.routerProps}*/}
          {/*          actionResolvedPromise={actionResolvedPromise}*/}
          {/*        />*/}
          {/*      </React.Fragment>*/}
          {/*    );*/}
          {/*  }}*/}
          {/*/>*/}
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
              <Login dispatch={props.componentProps.dispatch} state={props.componentProps.state} />
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
        </Then>
      </If>
    </React.Fragment>
  );
};
Global.displayName = 'Global';
export default Global;
