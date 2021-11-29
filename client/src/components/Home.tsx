import React, { useEffect, useRef, useState } from 'react';
import { useTrackedState, useTrackedStateShared } from '../selectors/stateContextSelector';
import { crawlerPython, getRepoImages } from '../services';
import { useClickOutside, useEventHandlerComposer } from '../hooks/hooks';
import useDeepCompareEffect from '../hooks/useDeepCompareEffect';
import { useScrollSaver } from '../hooks/useScrollSaver';
import clsx from 'clsx';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
import useResizeObserver from '../hooks/useResizeObserver';
import { useLocation } from 'react-router-dom';
import useFetchUser from '../hooks/useFetchUser';
import Mutex from '../util/mutex/mutex';
import { createStore } from '../util/hooksy';
import MasonryCard from './HomeBody/MasonryCard';
import { ShouldRender } from '../typing/enum';
import { useMouseSpawn } from './HomeBody/CardBody/TopicsCardBody/Topic';
import ScrollToTopLayout from './Layout/ScrollToTopLayout';
import LoginGQL from './HomeBody/CardBody/StargazersCardBody/LoginGQL';
import BottomNavigationBar from './HomeBody/BottomNavigationBar';

const mutex = new Mutex();
export const defaultIsFetchFinish = { isFetchFinish: false };
export const defaultNotification = { notification: '' };
export const [useIsFetchFinish] = createStore(defaultIsFetchFinish);
export const [useNotification] = createStore(defaultNotification);

const Home = () => {
  const isFinished = useRef(false);
  const abortController = new AbortController();
  const [notification, setNotification] = useNotification();
  const [isFetchFinish] = useIsFetchFinish();

  const displayName: string = (Home as React.ComponentType<any>).displayName || '';
  const { fetchMoreTopics, fetchUser, onClickTopic, clickedGQLTopic } = useFetchUser({
    component: displayName,
    abortController,
  });
  const location = useLocation();
  const axiosCancel = useRef<boolean>(false);
  const [state, dispatch] = useTrackedState();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  // useRef will assign a reference for each component, while a variable defined outside a function component will only be called once.
  // so don't use let page=1 outside of Home component. useRef makes sure same reference is returned during each render while it won't cause re-render
  // https://stackoverflow.com/questions/57444154/why-need-useref-to-contain-mutable-variable-but-not-define-variable-outside-the
  const windowScreenRef = useRef<HTMLDivElement>(null);
  const dataAlreadyFetch = useRef<number>();
  const isMergedDataExist = state.mergedData.length > 0;
  const isSeenCardsExist = stateShared?.seenCards?.size > 0 || false;
  const isTokenRSSExist = (localStorage.getItem('tokenRSS') || '').length > 0;

  useEffect(() => {
    return () => {
      if (!window.location.href.includes('detail')) {
        dispatch({
          type: 'REMOVE_ALL',
        });
        axiosCancel.current = true;
        isFinished.current = true;
        abortController.abort();
      }
      //cancel the fetch when the user go away from current page or when typing again to search
    };
  }, []);

  useResizeObserver(windowScreenRef, (entry: any) => {
    if (stateShared.width !== entry.contentRect.width && stateShared.shouldRender === ShouldRender.Home) {
      dispatchShared({
        type: 'SET_WIDTH',
        payload: {
          width: entry.contentRect.width,
        },
      });
    }
  });

  useDeepCompareEffect(() => {
    if (
      stateShared.queryUsername.length > 0 &&
      state.mergedData.length === 0 &&
      location.pathname === '/' &&
      !isFinished.current &&
      !isFetchFinish.isFetchFinish &&
      state.filterBySeen
    ) {
      dataAlreadyFetch.current = 0;
      fetchUser().then(() => {});
    }
  }, [stateShared.queryUsername, stateShared.perPage, state.mergedData, axiosCancel.current]);

  useEffect(() => {
    if (state.page === 1 && state.mergedData.length > 0 && stateShared.queryUsername.length > 0) {
      dispatch({
        type: 'MERGED_DATA_ADDED',
        payload: {
          data: [],
        },
      });
      fetchUser().then(() => {});
    } else if (
      stateShared.queryUsername.length === 0 &&
      clickedGQLTopic.queryTopic !== '' &&
      state.filterBySeen &&
      state.page === 1
    ) {
      dispatch({
        type: 'MERGED_DATA_ADDED',
        payload: {
          data: [],
        },
      });
      fetchMoreTopics().then(() => {});
    }
  }, [state.page]);

  useEffect(() => {
    if (location.pathname === '/' && !isFinished.current && state.page > 1 && !isFetchFinish.isFetchFinish) {
      dataAlreadyFetch.current = 0;
      dispatch({
        type: 'MERGED_DATA_ADDED',
        payload: {
          data: [],
        },
      });
      if (stateShared.queryUsername.length > 0) {
        fetchUser().then(() => {});
      } else if (stateShared.queryUsername.length === 0 && clickedGQLTopic.queryTopic !== '' && state.filterBySeen) {
        dispatch({
          type: 'MERGED_DATA_ADDED',
          payload: {
            data: [],
          },
        });
        fetchMoreTopics().then(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.page, axiosCancel.current]);

  useEffect(() => {
    if (!isFinished.current && isTokenRSSExist && location.pathname === '/') {
      dispatchShared({
        type: 'TOKEN_RSS_ADDED',
        payload: {
          tokenRSS: localStorage.getItem('tokenRSS') || '',
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTokenRSSExist]);

  useEffect(() => {
    if (
      !isFinished.current &&
      isSeenCardsExist &&
      location.pathname === '/' &&
      !isFinished.current &&
      !state.filterBySeen
    ) {
      if (notification.notification.length > 0) setNotification({ notification: '' });
      dispatch({
        type: 'MERGED_DATA_ADDED',
        payload: {
          data: state.undisplayMergedData,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSeenCardsExist, location.pathname, state.filterBySeen, state.undisplayMergedData]);

  useEffect(
    () => {
      (async () => {
        if (
          location.pathname === '/' &&
          !isFinished.current &&
          !isFetchFinish.isFetchFinish &&
          isMergedDataExist &&
          state.filterBySeen
        ) {
          const release = await mutex.acquire(); //if no MUTEX, there's no guarantee fetch will be executed too much
          // so we need to use mutex so any pending execution of asnyc here will be put in Event Loop and after the lock released will resume

          const data = state.mergedData.slice(dataAlreadyFetch.current).reduce((acc, object) => {
            acc.push(
              Object.assign(
                {},
                {
                  id: object.id,
                  value: {
                    full_name: object.full_name,
                    branch: object.default_branch,
                    ownerName: object.owner.login,
                  },
                }
              )
            );
            return acc;
          }, [] as any[]);
          dataAlreadyFetch.current = state.mergedData.length;
          const iters = data[Symbol.iterator]();
          const nextExecuteCrawler = (chunk: any, resolve: any) => {
            let data = chunk;
            crawlerPython({
              signal: abortController.signal,
              data: data,
            }).then((response) => {
              if (abortController.signal.aborted) return;
              if (response) {
                const output = Object.assign(
                  {},
                  {
                    id: data.id,
                    webLink: response.webLink || '',
                    profile: {
                      bio: response.profile.bio || '',
                      homeLocation: response.profile.homeLocation || [],
                      twitter: response.profile.twitter || [],
                      url: response.profile.url || [],
                      worksFor: response.profile.worksFor || [],
                    },
                  }
                );
                dispatch({
                  type: 'SET_CARD_ENHANCEMENT',
                  payload: {
                    cardEnhancement: output,
                  },
                });
              }
              const chunk = iters.next();
              if (chunk.done) {
                resolve('');
              } else {
                nextExecuteCrawler(chunk.value, resolve);
              }
            });
          };
          const nextExecuteImages = (chunk: any, resolve: any) => {
            getRepoImages({
              signal: abortController.signal,
              data: chunk,
            }).then((response: any) => {
              if (abortController.signal.aborted) return;
              if (response && response?.value?.length > 0) {
                dispatch({
                  type: 'IMAGES_DATA_ADDED',
                  payload: {
                    images: [{ id: response.id, value: response.value }],
                  },
                });
              }
              const chunk = iters.next();
              if (chunk.done) {
                resolve('');
              } else {
                nextExecuteImages(chunk.value, resolve);
              }
            });
          };
          const execute = () => {
            return new Promise((resolve, reject) => {
              for (let index = 0; index < data.length; index++) {
                const chunk = iters.next();
                nextExecuteImages(chunk.value, resolve);
                nextExecuteCrawler(chunk.value, resolve);
              }
            });
          };
          Promise.all([execute()]).then(() => {
            release();
          });
          // while (promises.length) {
          //   // 3 concurrent request at at time (batch mode) but if there is two more queue items, it won't go immediately to fill the empty slot so need to use pMap
          //   await Promise.all(promises.splice(0, 3).map((f) => f.then(noop)));
          // }
        }
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.mergedData.length, axiosCancel.current, state.filterBySeen]
  );
  const { getRootProps } = useEventHandlerComposer({ onClickCb: onClickTopic });

  const whichToUse = () => {
    //
    // useCallback will avoid unnecessary child re-renders due to something changing in the parent that
    // is not part of the dependencies for the callback.
    if (state.filteredMergedData.length > 0) {
      return state.filteredMergedData;
    }
    return state.mergedData; // return this if filteredTopics.length === 0
  };
  useScrollSaver(window.location.href);

  window.onbeforeunload = () => {
    abortController.abort(); //cancel the fetch when the user go away from current page or when typing again to search
    return window.close();
  };
  const [mouse] = useMouseSpawn();
  const notLoggedInRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(stateShared.shouldRender === ShouldRender.LoginGQL);
  useClickOutside(notLoggedInRef, () => setVisible(false));
  useEffect(() => {
    if (!isFinished.current && stateShared.shouldRender === ShouldRender.LoginGQL) {
      setVisible(true);
    }
  }, [mouse.x, mouse.y]);
  return (
    <React.Fragment>
      {/*we want ScrollPositionManager to be unmounted when router changes because the way it works is to save scroll position
       when unmounted*/}
      <div className={'top'} />
      <div
        ref={windowScreenRef}
        className={clsx('', {
          header: isMergedDataExist,
        })}
        style={{
          zIndex: state.visible ? -1 : 0,
          position: 'relative',
        }}
      >
        {
          // we want to render Card first and ImagesCard later because it requires more bandwith
          // so no need to use state.imagesData condition on top of state.mergedData?.length > 0 && !shouldRenderSkeleton
          // below, otherwise it's going to slow to wait for ImagesCard as the Card won't get re-render instantly consequently
        }
        <If condition={!state.filterBySeen}>
          <Then>
            <div style={{ textAlign: 'center' }}>
              <h3>Your {whichToUse().length || 0} Card History:</h3>
            </div>
          </Then>
        </If>

        <If condition={isMergedDataExist}>
          <Then>
            <MasonryCard data={whichToUse()} getRootProps={getRootProps} />
            <ScrollToTopLayout />
          </Then>
        </If>

        {/*{state.filterBySeen &&*/}
        {/*  isLoading &&*/}
        {/*  renderLoading &&*/}
        {/*  notification.notification.length === 0 &&*/}
        {/*  !isFetchFinish.isFetchFinish && <LoadingEye queryUsername={stateShared.queryUsername} />}*/}

        <If condition={notification.notification}>
          <Then>
            <div
              style={{
                zIndex: state.visible ? -1 : 0,
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <p>
                <a className={'underlining'} style={{ fontSize: '30px', color: 'black' }}>
                  {notification.notification}
                </a>
              </p>
            </div>
          </Then>
        </If>
      </div>
      <If condition={stateShared.width > 750}>
        <Then>
          <BottomNavigationBar />
        </Then>
      </If>
      <div
        style={{
          left: `${mouse.x + 20}px`,
          top: `${mouse.y - 40}px`,
          position: 'absolute',
        }}
        ref={notLoggedInRef}
      >
        {visible && stateShared.shouldRender === ShouldRender.LoginGQL && stateShared.tokenGQL.length === 0 && (
          <LoginGQL setVisible={setVisible} style={{ display: 'absolute', width: 'fit-content' }} />
        )}
      </div>
    </React.Fragment>
  );
};
Home.displayName = 'Home';
export default React.memo(Home);
