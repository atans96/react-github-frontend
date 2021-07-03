import { useLocation } from 'react-router-dom';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTrackedState, useTrackedStateDiscover, useTrackedStateShared } from './selectors/stateContextSelector';
import KeepMountedLayout from './Layout/KeepMountedLayout';
import { createRenderElement } from './Layout/MasonryLayout';
import { loadable } from './loadable';

import { ActionResolvePromise, IAction, IDataOne, IStateDiscover, Output } from './typing/interface';
import { fastFilter } from './util';
import { LanguagePreference, MergedDataProps } from './typing/type';
import { filterActionResolvedPromiseData, noop } from './util/util';
import { alreadySeenCardSelector } from './selectors/stateSelector';
import { useApolloFactory } from './hooks/useApolloFactory';
import { ActionShared } from './store/Shared/reducer';
import { ActionDiscover } from './store/Discover/reducer';

interface DiscoverProps {
  location: string;
  actionResolvePromise: (args: ActionResolvePromise) => Output;
  perPage: number;
  stateDiscover: Pick<
    IStateDiscover,
    | 'visibleDiscover'
    | 'pageDiscover'
    | 'mergedDataDiscover'
    | 'isLoadingDiscover'
    | 'notificationDiscover'
    | 'filterMergedDataDiscover'
  >;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
  dispatchDiscover: React.Dispatch<IAction<ActionDiscover>>;
}

const Discover = (condition: boolean, args: DiscoverProps) =>
  loadable({
    importFn: () => import('./Discover').then((module) => createRenderElement(module.default, { ...args })),
    cacheId: 'Discover',
    condition: condition,
    empty: () => <></>,
  });
const SearchBarDiscover = (condition: boolean) =>
  loadable({
    importFn: () => import('./SearchBarDiscover').then((module) => createRenderElement(module.default, {})),
    cacheId: 'SearchBarDiscover',
    condition: condition,
    empty: () => <></>,
  });

interface PaginationBarDiscover {
  drawerWidth: number;
}
const PaginationBarDiscover = (condition: boolean, args: PaginationBarDiscover) =>
  loadable({
    importFn: () =>
      import('./DiscoverBody/PaginationBarDiscover').then((module) => createRenderElement(module.default, { ...args })),
    cacheId: 'PaginationBarDiscover',
    condition: condition,
    empty: () => <></>,
  });

const DiscoverRender = () => {
  const location = useLocation();
  const locationRef = useRef(location.pathname);
  const [state, dispatch] = useTrackedState();
  const { userData } = useApolloFactory(Function.name).query.getUserData();
  const { userStarred, loadingUserStarred, errorUserStarred } = useApolloFactory(
    Function.name
  ).query.getUserInfoStarred();
  const { seenData, seenDataLoading, seenDataError } = useApolloFactory(Function.name).query.getSeen();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [stateDiscover, dispatchDiscover] = useTrackedStateDiscover();
  const alreadySeenCards: number[] = React.useMemo(() => {
    //Every time Global re-renders and nothing is memoized because each render re creates the selector.
    // To solve this we can use React.useMemo. Here is the correct way to use createSelectItemById.
    return alreadySeenCardSelector(seenData?.getSeen?.seenCards ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seenData?.getSeen?.seenCards]);

  const languagePreference = React.useMemo(() => {
    return new Map(
      userData?.getUserData?.languagePreference.map((obj: LanguagePreference) => [obj.language, obj]) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.getUserData?.languagePreference]);
  const languagePreferenceRef = useRef(languagePreference);
  const userStarredRef = useRef(userStarred?.getUserInfoStarred?.starred);
  const alreadySeenCardsRef = useRef<number[]>([]);
  useEffect(() => {
    let isFinished = false;
    if (!isFinished && ['/', '/discover'].includes(location.pathname)) {
      alreadySeenCardsRef.current = [...alreadySeenCards];
      return () => {
        isFinished = true;
      };
    }
  });
  useEffect(() => {
    let isFinished = false;
    if (!isFinished && ['/', '/discover'].includes(location.pathname)) {
      languagePreferenceRef.current = languagePreference;
      return () => {
        isFinished = true;
      };
    }
  });
  useEffect(() => {
    let isFinished = false;
    if (!isFinished && ['/', '/discover'].includes(location.pathname)) {
      userStarredRef.current = userStarred?.getUserInfoStarred?.starred;
      return () => {
        isFinished = true;
      };
    }
  });
  const actionAppend = (data: IDataOne | any, displayName: string) => {
    if (state.filterBySeen && !loadingUserStarred && !seenDataLoading && !errorUserStarred && !seenDataError) {
      return new Promise(function (resolve, reject) {
        switch (displayName) {
          case displayName.match(/^discover/gi) && displayName!.match(/^discover/gi)![0].length > 0
            ? displayName
            : undefined: {
            let filter1 = fastFilter(
              (obj: MergedDataProps) =>
                filterActionResolvedPromiseData(
                  obj,
                  !alreadySeenCardsRef?.current?.includes(obj.id) && !userStarredRef?.current?.includes(obj.id),
                  !!languagePreferenceRef?.current?.get(obj.language)?.checked
                ),
              data
            );
            if (filter1.length > 0) {
              dispatchDiscover({
                type: 'MERGED_DATA_APPEND_DISCOVER',
                payload: {
                  data: filter1,
                },
              });
            } else if (filter1.length === 0) {
              dispatchDiscover({
                type: 'ADVANCE_PAGE_DISCOVER',
              });
            }
            resolve();
            break;
          }
          case 'Home': {
            const filter1 = fastFilter(
              (obj: MergedDataProps) =>
                filterActionResolvedPromiseData(
                  obj,
                  !alreadySeenCardsRef?.current?.includes(obj.id),
                  !!languagePreferenceRef?.current?.get(obj.language)
                ),
              data.dataOne
            );
            dispatch({
              type: 'MERGED_DATA_APPEND',
              payload: {
                data: filter1,
              },
            });
            if (filter1.length === 0) {
              dispatch({
                type: 'ADVANCE_PAGE',
              });
            } else {
              const temp = data.dataOne || data;
              temp.map((obj: MergedDataProps) => {
                obj['isQueue'] = false;
                return obj;
              });
              dispatch({
                type: 'MERGED_DATA_APPEND',
                payload: {
                  data: temp,
                },
              });
            }
            resolve();
            break;
          }
          default: {
            throw new Error('No valid component found!');
          }
        }
      });
    }
  };
  const actionResolvePromise = useCallback(
    ({
      action,
      data = undefined,
      setLoading,
      isFetchFinish,
      displayName,
      setNotification,
      error = undefined,
      prefetch = noop,
    }) => {
      if (!loadingUserStarred && !errorUserStarred && !seenDataLoading && !seenDataError) {
        setLoading(false);
        if (data && action === 'append') {
          actionAppend(data, displayName)!.then(() => prefetch());
        }
        if (action === 'noData') {
          isFetchFinish = true;
          setNotification(`Sorry, no more data found for ${stateShared.queryUsername}`);
        }
        if (action === 'error' && error) {
          throw new Error(`Something wrong at ${displayName} ${error}`);
        }
        if (data && data.error_404) {
          setNotification(`Sorry, no data found for ${stateShared.queryUsername}`);
        } else if (data && data.error_403) {
          isFetchFinish = true;
          setNotification('Sorry, API rate limit exceeded.');
        } else if (data && data.error_message) {
          throw new Error(`Something wrong at ${displayName} ${data.error_message}`);
        }
      }
      return { isFetchFinish };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stateShared.queryUsername, userStarred, loadingUserStarred, errorUserStarred, seenDataLoading, seenDataError]
  );
  return (
    <KeepMountedLayout
      mountedCondition={location.pathname === '/discover'}
      render={() => {
        return (
          <React.Fragment>
            {SearchBarDiscover(location.pathname === '/discover')}
            {Discover(location.pathname === '/discover', {
              perPage: stateShared.perPage,
              location: locationRef.current,
              stateDiscover: {
                pageDiscover: stateDiscover.pageDiscover,
                mergedDataDiscover: stateDiscover.mergedDataDiscover,
                isLoadingDiscover: stateDiscover.isLoadingDiscover,
                notificationDiscover: stateDiscover.notificationDiscover,
                filterMergedDataDiscover: stateDiscover.filterMergedDataDiscover,
                visibleDiscover: stateDiscover.visibleDiscover,
              },
              actionResolvePromise,
              dispatchShared,
              dispatchDiscover,
            })}
            {PaginationBarDiscover(location.pathname === '/discover', {
              drawerWidth: stateShared.drawerWidth,
            })}
          </React.Fragment>
        );
      }}
    />
  );
};
DiscoverRender.displayName = 'DiscoverRender';
export default DiscoverRender;
