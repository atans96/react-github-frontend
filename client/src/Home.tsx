import React, { useEffect, useRef, useState } from 'react';
import { useTrackedState, useTrackedStateShared } from './selectors/stateContextSelector';
import { useApolloFactory } from './hooks/useApolloFactory';
import { MergedDataProps, SeenProps } from './typing/type';
import { noop } from './util/util';
import { fastFilter, useStableCallback } from './util';
import { crawlerPython, getRepoImages } from './services';
import useBottomHit from './hooks/useBottomHit';
import { useEventHandlerComposer } from './hooks/hooks';
import useDeepCompareEffect from './hooks/useDeepCompareEffect';
import { useScrollSaver } from './hooks/useScrollSaver';
import clsx from 'clsx';
import { If } from './util/react-if/If';
import { Then } from './util/react-if/Then';
import useResizeObserver from './hooks/useResizeObserver';
import Loadable from 'react-loadable';
import { useLocation } from 'react-router-dom';
import useFetchUser from './hooks/useFetchUser';
import Empty from './Layout/EmptyLayout';
import Mutex from './util/mutex/mutex';
import { createStore } from './util/hooksy';
const mutex = new Mutex();

const MasonryCard = Loadable({
  loader: () => import(/* webpackChunkName: "MasonryCard" */ './HomeBody/MasonryCard'),
  loading: Empty,
  delay: 300, // 0.3 seconds
});

const LoadingEye = Loadable({
  loading: Empty,
  loader: () => import(/* webpackChunkName: "LoadingEye" */ './LoadingEye'),
  delay: 300, // 0.3 seconds
});

const BottomNavigationBar = Loadable({
  loading: Empty,
  loader: () => import(/* webpackChunkName: "BottomNavigationBar" */ './HomeBody/BottomNavigationBar'),
  delay: 300, // 0.3 seconds
});
const ScrollToTopLayout = Loadable({
  loading: Empty,
  loader: () => import(/* webpackChunkName: "ScrollToTopLayout" */ './Layout/ScrollToTopLayout'),
  delay: 300, // 0.3 seconds
});
const defaultIsFetchFinish = { isFetchFinish: false };
const defaultIsLoading = { isLoading: false };
const defaultNotification = { notification: '' };
export const [useIsFetchFinish] = createStore(defaultIsFetchFinish);
export const [useIsLoading] = createStore(defaultIsLoading);
export const [useNotification] = createStore(defaultNotification);

const Home = React.memo(() => {
  const abortController = new AbortController();
  const [notification, setNotification] = useNotification();
  const [isFetchFinish] = useIsFetchFinish();
  const [isLoading] = useIsLoading();

  const displayName: string = (Home as React.ComponentType<any>).displayName || '';
  const { fetchTopics, fetchUser, onClickTopic, clickedGQLTopic } = useFetchUser({
    component: displayName,
    abortController,
  });
  const location = useLocation();
  const axiosCancel = useRef<boolean>(false);
  const [state, dispatch] = useTrackedState();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const { seenData, seenDataLoading, seenDataError } = useApolloFactory(displayName!).query.getSeen();
  const { userData, userDataLoading, userDataError } = useApolloFactory(displayName!).query.getUserData();
  const seenAdded = useApolloFactory(displayName!).mutation.seenAdded;
  // useRef will assign a reference for each component, while a variable defined outside a function component will only be called once.
  // so don't use let page=1 outside of Home component. useRef makes sure same reference is returned during each render while it won't cause re-render
  // https://stackoverflow.com/questions/57444154/why-need-useref-to-contain-mutable-variable-but-not-define-variable-outside-the
  const windowScreenRef = useRef<HTMLDivElement>(null);
  const dataAlreadyFetch = useRef<number>();
  const isMergedDataExist = state.mergedData.length > 0;
  const isSeenCardsExist =
    (seenData?.getSeen?.seenCards && seenData.getSeen.seenCards.length > 0 && !seenDataLoading && !seenDataError) ||
    false;
  const isTokenRSSExist = (localStorage.getItem('tokenRSS') || '').length > 0 && !userDataLoading && !userDataError;

  const handleBottomHit = useStableCallback(() => {
    if (
      !isFetchFinish.isFetchFinish &&
      state.mergedData.length > 0 &&
      !isLoading.isLoading &&
      location.pathname === '/' &&
      notification.notification === '' &&
      state.filterBySeen
    ) {
      dispatch({
        type: 'ADVANCE_PAGE',
      });
      if (state.imagesData.length > 0 && stateShared.isLoggedIn) {
        const result = state.mergedData.reduce((acc, obj: MergedDataProps) => {
          const temp = Object.assign(
            {},
            {
              stargazers_count: Number(obj.stargazers_count),
              full_name: obj.full_name,
              default_branch: obj.default_branch,
              owner: {
                login: obj.owner.login,
                avatar_url: obj.owner.avatar_url,
                html_url: obj.owner.html_url,
              },
              description: obj.description,
              language: obj.language,
              topics: obj.topics,
              html_url: obj.html_url,
              id: obj.id,
              imagesData: state.imagesData.filter((xx) => xx.id === obj.id).map((obj) => [...obj.value])[0] || [],
              name: obj.name,
              is_queried: false,
            }
          );
          acc.push(temp);
          return acc;
        }, [] as SeenProps[]);
        if (result.length > 0) seenAdded(result).then(noop);
      }
    }
  });

  useBottomHit(
    windowScreenRef,
    handleBottomHit,
    isLoading.isLoading || !isMergedDataExist || isFetchFinish.isFetchFinish // include isFetchFinish to indicate not to listen anymore
  );

  useResizeObserver(windowScreenRef, (entry: any) => {
    if (stateShared.width !== entry.contentRect.width) {
      dispatchShared({
        type: 'SET_WIDTH',
        payload: {
          width: entry.contentRect.width,
        },
      });
    }
  });
  useDeepCompareEffect(() => {
    let isFinished = false;
    // when the username changes, that means the user submit form at SearchBar.js + dispatchMergedData([]) there
    if (
      stateShared.queryUsername.length > 0 &&
      state.mergedData.length === 0 &&
      location.pathname === '/' &&
      !isFinished &&
      !isFetchFinish.isFetchFinish
    ) {
      // we want to preserve stateShared.queryUsername so that when the user navigate away from Home, then go back again, and do the scroll again,
      // we still want to retain the memory of username so that's why we use reducer of stateShared.queryUsername.
      // However, as the component unmount, stateShared.queryUsername is not "", thus causing fetchUser to fire in useEffect
      // to prevent that, use state.mergedData.length === 0 so that when it's indeed 0, that means no data anything yet so need to fetch first time
      // otherwise, don't re-fetch. in this way, stateShared.queryUsername and state.mergedData are still preserved
      dataAlreadyFetch.current = 0;
      fetchUser();
    }
    return () => {
      isFinished = true;
    };
    // when you type google in SearchBar.js, then perPage=10, you can fetch. then when you change perPage=40 and type google again
    // it cannot fetch because if the dependency array of fetchUser() is only [stateShared.queryUsername] so stateShared.queryUsername not change so not execute
    // so you need another dependency of stateShared.perPage
    // you also need state.mergedData because on submit in SearchBar.js, you specify dispatchMergedData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateShared.queryUsername, stateShared.perPage, state.mergedData, axiosCancel.current]);

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/' && !isFinished && state.page > 1 && !isFetchFinish.isFetchFinish) {
      dataAlreadyFetch.current = 0;
      if (stateShared.queryUsername.length > 0) {
        fetchUser();
      } else if (stateShared.queryUsername.length === 0 && clickedGQLTopic.queryTopic !== '' && state.filterBySeen) {
        fetchTopics();
      }
    }
    return () => {
      isFinished = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.page, axiosCancel.current]);

  useEffect(() => {
    return () => {
      console.log('abort');
      abortController.abort(); //cancel the fetch when the user go away from current page or when typing again to search
      axiosCancel.current = true;
    };
  }, []);

  useEffect(() => {
    let isFinished = false;
    if (!isFinished && isTokenRSSExist && location.pathname === '/') {
      dispatchShared({
        type: 'TOKEN_RSS_ADDED',
        payload: {
          tokenRSS: localStorage.getItem('tokenRSS') || '',
        },
      });
    }
    return () => {
      isFinished = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTokenRSSExist]);

  useEffect(() => {
    let isFinished = false;
    if (!isFinished && isSeenCardsExist && location.pathname === '/' && !isFinished && state.filterBySeen) {
      setNotification({ notification: '' });
      const ids = state.undisplayMergedData.reduce((acc, obj) => {
        acc.push(obj.id);
        return acc;
      }, [] as number[]);
      const temp = fastFilter((obj: MergedDataProps) => !ids.includes(obj.id), state.mergedData);
      const images = fastFilter((image: Record<string, any>) => !ids.includes(image.id), state.imagesData);
      dispatch({
        type: 'IMAGES_DATA_REPLACE',
        payload: {
          imagesData: images,
        },
      });
      dispatch({
        type: 'MERGED_DATA_ADDED',
        payload: {
          data: temp,
        },
      });
    }
    return () => {
      isFinished = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filterBySeen]);

  useDeepCompareEffect(() => {
    let isFinished = false;
    if (!isFinished && isSeenCardsExist && location.pathname === '/' && !isFinished && !state.filterBySeen) {
      dispatch({
        type: 'UNDISPLAY_MERGED_DATA',
        payload: {
          undisplayMergedData: seenData.getSeen.seenCards,
        },
      });
      const temp = seenData.getSeen.seenCards ?? [];
      const images = temp!.reduce((acc: any[], obj: SeenProps) => {
        acc.push(
          Object.assign(
            {},
            {
              id: obj.id,
              value: [...obj.imagesData],
            }
          )
        );
        return acc;
      }, [] as SeenProps[]);
      dispatch({
        type: 'IMAGES_DATA_ADDED',
        payload: {
          images: images,
        },
      });
      dispatch({
        type: 'MERGED_DATA_ADDED',
        payload: {
          data: seenData.getSeen.seenCards,
        },
      });
    }
    return () => {
      isFinished = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seenDataLoading, seenDataError, seenData, location.pathname, state.filterBySeen]);

  useEffect(
    () => {
      let isFinished = false;
      (async () => {
        if (location.pathname === '/' && !isFinished && !isFetchFinish.isFetchFinish) {
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
              topic: Array.isArray(stateShared.queryUsername)
                ? stateShared.queryUsername[0]
                : stateShared.queryUsername,
              page: state.page,
            }).then((response) => {
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
              topic: Array.isArray(stateShared.queryUsername)
                ? stateShared.queryUsername[0]
                : stateShared.queryUsername,
              page: state.page,
              axiosCancel: axiosCancel.current,
            }).then((response: any) => {
              if (response && response.length > 0) {
                dispatch({
                  type: 'IMAGES_DATA_ADDED',
                  payload: {
                    images: response,
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
          const executeImages = () => {
            return new Promise((resolve, reject) => {
              for (let index = 0; index < 2; index++) {
                const chunk = iters.next();
                nextExecuteImages(chunk.value, resolve);
              }
            });
          };
          Promise.all([executeImages()]).then(() => {
            release();
          });
          // while (promises.length) {
          //   // 3 concurrent request at at time (batch mode) but if there is two more queue items, it won't go immediately to fill the empty slot so need to use pMap
          //   await Promise.all(promises.splice(0, 3).map((f) => f.then(noop)));
          // }
        }
      })();
      return () => {
        isFinished = true;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.mergedData.length, axiosCancel.current]
  );
  const { getRootProps } = useEventHandlerComposer({ onClickCb: onClickTopic });

  const whichToUse = () => {
    // useCallback will avoid unnecessary child re-renders due to something changing in the parent that
    // is not part of the dependencies for the callback.
    if (state.filteredMergedData.length > 0) {
      return state.filteredMergedData;
    }
    return state.mergedData; // return this if filteredTopics.length === 0
  };
  useScrollSaver(location.pathname, '/');
  const [renderLoading, setRenderLoading] = useState(false);
  function clear(timeout: any) {
    return clearTimeout(timeout);
  }
  const timeoutRef = useRef<any>();

  useEffect(() => {
    if (isLoading.isLoading && !isMergedDataExist) {
      timeoutRef.current = setTimeout(() => {
        clear(timeoutRef.current);
        if (isLoading.isLoading) {
          setRenderLoading(isLoading.isLoading);
        } else {
          clear(timeoutRef.current);
        }
      }, 1000);
    }
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [isLoading.isLoading, isMergedDataExist]);

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
          marginLeft: `${stateShared.drawerWidth > 0 ? 170 : 50}px`,
          zIndex: state.visible ? -1 : 0,
        }}
      >
        {
          // we want to render Card first and ImagesCard later because it requires more bandwith
          // so no need to use state.imagesData condition on top of state.mergedData?.length > 0 && !shouldRenderSkeleton
          // below, otherwise it's going to slow to wait for ImagesCard as the Card won't get re-render instantly consequently
        }
        <If condition={!state.filterBySeen && isSeenCardsExist}>
          <Then>
            <div style={{ textAlign: 'center' }}>
              <h3>Your {(seenData?.getSeen?.seenCards && seenData.getSeen.seenCards.length) || 0} Card History:</h3>
            </div>
          </Then>
        </If>

        <If condition={isMergedDataExist}>
          <Then>
            <MasonryCard data={whichToUse()} getRootProps={getRootProps} />
            <ScrollToTopLayout />
          </Then>
        </If>

        {isLoading && renderLoading && <LoadingEye queryUsername={stateShared.queryUsername} />}

        <If condition={notification.notification}>
          <Then>
            <div style={{ textAlign: 'center' }}>
              <p>
                <a className={'underlining'} style={{ fontSize: '30px', color: 'black' }}>
                  {notification.notification}
                </a>
              </p>
            </div>
          </Then>
        </If>
      </div>
      {stateShared.width > 1100 && <BottomNavigationBar />}
    </React.Fragment>
  );
});
Home.displayName = 'Home';
export default Home;
