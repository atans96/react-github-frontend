import React, { useCallback, useEffect, useRef } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Login from './Login';
import ManageProfile from './ManageProfile';
import Home from './Home';
import KeepMountedLayout from './Layout/KeepMountedLayout';
import { Then } from './util/react-if/Then';
import { If } from './util/react-if/If';
import Details from './Details';
import {
  IAction,
  IDataOne,
  IState,
  IStateDiscover,
  IStateManageProfile,
  IStateRateLimit,
  IStateShared,
  IStateStargazers,
} from './typing/interface';
import SearchBar from './SearchBar';
import { getTokenGQL } from './services';
import Discover from './Discover';
import PrefetchKeepMountedLayout from './Layout/PrefetchKeepMountedLayout';
import SearchBarDiscover from './SearchBarDiscover';
import useUserVerification from './hooks/useUserVerification';
import { alreadySeenCardSelector } from './selectors/stateSelector';
import { fastFilter } from './util';
import { filterActionResolvedPromiseData } from './util/util';
import { useApolloFactory } from './hooks/useApolloFactory';
import { LanguagePreference, MergedDataProps, Nullable } from './typing/type';
import eye from './new_16-2.gif';
import { ActionStargazers } from './store/Staargazers/reducer';
import { ActionDiscover } from './store/Discover/reducer';
import { ActionManageProfile } from './store/ManageProfile/reducer';
import { ActionShared } from './store/Shared/reducer';
import { Action } from './store/Home/reducer';

interface GlobalProps {
  state: IState;
  stateDiscover: IStateDiscover;
  stateStargazers: IStateStargazers;
  stateShared: IStateShared;
  stateManageProfile: IStateManageProfile;
  stateRateLimit: IStateRateLimit;
  dispatch: React.Dispatch<IAction<Action>>;
  dispatchStargazers: React.Dispatch<IAction<ActionStargazers>>;
  dispatchDiscover: React.Dispatch<IAction<ActionDiscover>>;
  dispatchManageProfile: React.Dispatch<IAction<ActionManageProfile>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
}
export enum ActionResolvedPromise {
  append = 'append',
  noData = 'noData',
  error = 'error',
  nonAppend = 'nonAppend',
}
const Global: React.FC<{
  routerProps: RouteComponentProps<any, any, any>;
  componentProps: GlobalProps;
}> = (props) => {
  const { verifiedLoading, username } = useUserVerification(props);
  useEffect(() => {
    if (!props.componentProps.stateShared.isLoggedIn) {
      props.componentProps.dispatchShared({
        type: 'LOGIN',
        payload: {
          isLoggedIn: !verifiedLoading && username !== '',
        },
      });
    }
    if (!verifiedLoading && username !== '') {
      getTokenGQL().then((res) => {
        if (res.tokenGQL) {
          props.componentProps.dispatchShared({
            type: 'TOKEN_ADDED',
            payload: {
              tokenGQL: res.tokenGQL,
            },
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    verifiedLoading,
    username,
    props.componentProps.stateShared.isLoggedIn,
    props.componentProps.stateShared.tokenGQL,
  ]);
  const displayName: string | undefined = (Global as React.ComponentType<any>).displayName;
  const { userData, userDataLoading } = useApolloFactory(displayName!).query.getUserData();
  const { userStarred, loadingUserStarred } = useApolloFactory(displayName!).query.getUserInfoStarred();
  const { seenData, seenDataLoading } = useApolloFactory(displayName!).query.getSeen();
  const alreadySeenCards: number[] = React.useMemo(() => {
    //Every time Global re-renders and nothing is memoized because each render re creates the selector.
    // To solve this we can use React.useMemo. Here is the correct way to use createSelectItemById.
    return alreadySeenCardSelector(seenData?.getSeen?.seenCards ?? []);
  }, [seenData?.getSeen?.seenCards]);

  const languagePreference = React.useMemo(() => {
    return new Map(userData?.getUserData?.languagePreference?.map((obj: LanguagePreference) => [obj.language, obj]));
  }, [userData?.getUserData?.languagePreference]);

  const languagePreferenceRef = useRef(languagePreference);
  const alreadySeenCardsRef = useRef(alreadySeenCards);
  useEffect(() => {
    alreadySeenCardsRef.current = alreadySeenCards;
  });
  useEffect(() => {
    languagePreferenceRef.current = languagePreference;
  });

  const actionAppend = (data: IDataOne | any, displayName: string) => {
    if (props.componentProps.state.filterBySeen) {
      switch (displayName) {
        case displayName.match(/^discover/gi) && displayName!.match(/^discover/gi)![0].length > 0
          ? displayName
          : undefined: {
          let filter1 = fastFilter(
            (obj: MergedDataProps) =>
              filterActionResolvedPromiseData(
                obj,
                !alreadySeenCardsRef.current.includes(obj.id),
                languagePreferenceRef.current.get(obj.language),
                userStarred?.getUserInfoStarred?.starred?.includes(obj.id) === false
              ),
            data
          );

          let inputForImagesData = [];
          if (filter1.length > 0) {
            props.componentProps.dispatchDiscover({
              type: 'MERGED_DATA_APPEND_DISCOVER',
              payload: {
                data: filter1,
              },
            });
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
            props.componentProps.dispatchDiscover({
              type: 'ADVANCE_PAGE_DISCOVER',
            });
          }
          break;
        }
        case 'Home': {
          const filter1 = fastFilter(
            (obj: MergedDataProps) =>
              filterActionResolvedPromiseData(
                obj,
                !alreadySeenCardsRef.current.includes(obj.id),
                languagePreferenceRef.current.get(obj.language)
              ),
            data.dataOne
          );
          const tempImages = fastFilter(
            (obj: MergedDataProps) => !alreadySeenCardsRef.current.includes(obj.id),
            data.renderImages
          );
          if (tempImages.length === 0) {
            props.componentProps.dispatch({
              type: 'IMAGES_DATA_ADDED',
              payload: {
                images: [],
              },
            });
          } else {
            props.componentProps.dispatch({
              type: 'IMAGES_DATA_ADDED',
              payload: {
                images: tempImages,
              },
            });
          }
          props.componentProps.dispatch({
            type: 'MERGED_DATA_APPEND',
            payload: {
              data: filter1,
            },
          });
          if (filter1.length === 0) {
            props.componentProps.dispatch({
              type: 'ADVANCE_PAGE',
            });
          } else {
            if (data.renderImages.length === 0) {
              props.componentProps.dispatch({
                type: 'IMAGES_DATA_ADDED',
                payload: {
                  images: [],
                },
              });
            } else {
              props.componentProps.dispatch({
                type: 'IMAGES_DATA_ADDED',
                payload: {
                  images: data.renderImages,
                },
              });
            }
            const temp = data.dataOne || data;
            temp.map((obj: MergedDataProps) => {
              obj['isQueue'] = false;
              return obj;
            });
            props.componentProps.dispatch({
              type: 'MERGED_DATA_APPEND',
              payload: {
                data: temp,
              },
            });
          }
          break;
        }
        default: {
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
      action: ActionResolvedPromise,
      setLoading: React.Dispatch<React.SetStateAction<boolean>>,
      setNotification: React.Dispatch<React.SetStateAction<string>>,
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
        setNotification(`Sorry, no more data found for ${props.componentProps.stateShared.username}`);
      }
      if (action === 'error' && error) {
        throw new Error(`Something wrong at ${displayName} ${error}`);
      }
      if (data && data.error_404) {
        setNotification(`Sorry, no data found for ${props.componentProps.stateShared.username}`);
      } else if (data && data.error_403) {
        isFetchFinish = true;
        setNotification('Sorry, API rate limit exceeded.');
      } else if (data && data.error_message) {
        throw new Error(`Something wrong at ${displayName} ${data.error_message}`);
      }
      return { isFetchFinish };
    },
    [props.componentProps.stateShared.username, userStarred, loadingUserStarred]
  );
  return (
    <React.Fragment>
      <If condition={seenDataLoading && userDataLoading && loadingUserStarred}>
        <Then>
          <div style={{ textAlign: 'center' }}>
            <img src={eye} style={{ width: '100px' }} />
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
                    stateShared={props.componentProps.stateShared}
                    state={props.componentProps.state}
                    stateStargazers={props.componentProps.stateStargazers}
                    dispatch={props.componentProps.dispatch}
                    dispatchStargazers={props.componentProps.dispatchStargazers}
                    dispatchShared={props.componentProps.dispatchShared}
                  />
                  <Home
                    stateStargazers={props.componentProps.stateStargazers}
                    stateShared={props.componentProps.stateShared}
                    dispatchStargazers={props.componentProps.dispatchStargazers}
                    dispatch={props.componentProps.dispatch}
                    dispatchShared={props.componentProps.dispatchShared}
                    state={props.componentProps.state}
                    actionResolvedPromise={actionResolvedPromise}
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
                  <SearchBarDiscover
                    stateShared={props.componentProps.stateShared}
                    stateDiscover={props.componentProps.stateDiscover}
                    dispatchDiscover={props.componentProps.dispatchDiscover}
                  />
                  <Discover
                    stateDiscover={props.componentProps.stateDiscover}
                    stateShared={props.componentProps.stateShared}
                    dispatchDiscover={props.componentProps.dispatchDiscover}
                    dispatchShared={props.componentProps.dispatchShared}
                    dispatchStargazers={props.componentProps.dispatchStargazers}
                    routerProps={props.routerProps}
                    actionResolvedPromise={actionResolvedPromise}
                  />
                </React.Fragment>
              );
            }}
          />

          <If condition={props.routerProps.location.pathname === '/login'}>
            <Then>
              <Login
                dispatchShared={props.componentProps.dispatchShared}
                stateShared={props.componentProps.stateShared}
              />
            </Then>
          </If>

          <If condition={props.routerProps.location.pathname === '/profile'}>
            <Then>
              <ManageProfile
                dispatchManageProfile={props.componentProps.dispatchManageProfile}
                stateShared={props.componentProps.stateShared}
                stateManageProfile={props.componentProps.stateManageProfile}
                dispatchShared={props.componentProps.dispatchShared}
                dispatch={props.componentProps.dispatch}
              />
            </Then>
          </If>

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
