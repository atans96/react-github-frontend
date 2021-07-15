import React, { useEffect, useRef } from 'react';
import { useTrackedState, useTrackedStateShared } from './selectors/stateContextSelector';
import { useApolloFactory } from './hooks/useApolloFactory';
import { ImagesDataProps, MergedDataProps, SeenProps } from './typing/type';
import { noop } from './util/util';
import { fastFilter, pMap, useStableCallback } from './util';
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

const MasonryCard = Loadable({
  loader: () => import(/* webpackChunkName: "MasonryCard" */ './HomeBody/MasonryCard'),
  loading: Empty,
  delay: 300, // 0.3 seconds
});
const MasonryLoading = Loadable({
  loading: Empty,
  loader: () => import(/* webpackChunkName: "MasonryLoading" */ './HomeBody/MasonryLoading'),
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

const Home = React.memo(() => {
  const { fetchUserMore, fetchUser, isLoading, notification, setNotification, onClickTopic, clickedGQLTopic } =
    useFetchUser({ component: 'Home' });
  const location = useLocation();
  const axiosCancel = useRef<boolean>(false);
  const [state, dispatch] = useTrackedState();
  const [, dispatchShared] = useTrackedStateShared();
  const [stateShared] = useTrackedStateShared();
  const abortController = new AbortController();
  const displayName: string | undefined = (Home as React.ComponentType<any>).displayName;
  const { seenData, seenDataLoading, seenDataError } = useApolloFactory(displayName!).query.getSeen();
  const { userData, userDataLoading, userDataError } = useApolloFactory(displayName!).query.getUserData();
  const seenAdded = useApolloFactory(displayName!).mutation.seenAdded;
  // useRef will assign a reference for each component, while a variable defined outside a function component will only be called once.
  // so don't use let page=1 outside of Home component. useRef makes sure same reference is returned during each render while it won't cause re-render
  // https://stackoverflow.com/questions/57444154/why-need-useref-to-contain-mutable-variable-but-not-define-variable-outside-the
  const isFetchFinish = useRef(false); // indicator to stop fetching when we have no more data
  const windowScreenRef = useRef<HTMLDivElement>(null);
  const isMergedDataExist = state.mergedData.length > 0;
  const isSeenCardsExist =
    (seenData?.getSeen?.seenCards && seenData.getSeen.seenCards.length > 0 && !seenDataLoading && !seenDataError) ||
    false;
  const isTokenRSSExist = userData?.getUserData?.tokenRSS?.length > 0 && !userDataLoading && !userDataError;

  const mergedDataRef = useRef<MergedDataProps[]>([]);
  const isLoadingRef = useRef<boolean>(false);
  const imagesDataRef = useRef<ImagesDataProps[]>([]);
  const filterBySeenRef = useRef<boolean>(state.filterBySeen);
  const notificationRef = useRef<string>('');

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/' && !isFinished) {
      mergedDataRef.current = state.mergedData;
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mergedData]);

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/' && !isFinished) {
      isLoadingRef.current = isLoading;
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/' && !isFinished) {
      notificationRef.current = notification;
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification]);

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/' && !isFinished) {
      imagesDataRef.current = state.imagesData;
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.imagesData]);

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/' && !isFinished) {
      filterBySeenRef.current = state.filterBySeen;
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filterBySeen]);

  const locationRef = useRef('/');
  useEffect(() => {
    locationRef.current = location.pathname;
  });

  const handleBottomHit = useStableCallback(() => {
    if (
      !isFetchFinish.current &&
      mergedDataRef.current.length > 0 &&
      !isLoadingRef.current &&
      locationRef.current === '/' &&
      notificationRef.current === '' &&
      filterBySeenRef.current
    ) {
      dispatch({
        type: 'ADVANCE_PAGE',
      });
      const result = mergedDataRef.current.reduce((acc, obj: MergedDataProps) => {
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
            imagesData: imagesDataRef.current.filter((xx) => xx.id === obj.id).map((obj) => [...obj.value])[0] || [],
            name: obj.name,
            is_queried: false,
          }
        );
        acc.push(temp);
        return acc;
      }, [] as SeenProps[]);
      if (result.length > 0 && imagesDataRef.current.length > 0 && stateShared.isLoggedIn) {
        seenAdded(result).then(noop);
      }
    }
  });

  useBottomHit(
    windowScreenRef,
    handleBottomHit,
    isLoading || !isMergedDataExist || isFetchFinish.current // include isFetchFinish to indicate not to listen anymore
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
      !isFinished
    ) {
      // we want to preserve stateShared.queryUsername so that when the user navigate away from Home, then go back again, and do the scroll again,
      // we still want to retain the memory of username so that's why we use reducer of stateShared.queryUsername.
      // However, as the component unmount, stateShared.queryUsername is not "", thus causing fetchUser to fire in useEffect
      // to prevent that, use state.mergedData.length === 0 so that when it's indeed 0, that means no data anything yet so need to fetch first time
      // otherwise, don't re-fetch. in this way, stateShared.queryUsername and state.mergedData are still preserved
      fetchUser();
      return () => {
        isFinished = true;
      };
    }
    // when you type google in SearchBar.js, then perPage=10, you can fetch. then when you change perPage=40 and type google again
    // it cannot fetch because if the dependency array of fetchUser() is only [stateShared.queryUsername] so stateShared.queryUsername not change so not execute
    // so you need another dependency of stateShared.perPage
    // you also need state.mergedData because on submit in SearchBar.js, you specify dispatchMergedData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateShared.queryUsername, stateShared.perPage, state.mergedData, axiosCancel.current]);

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/' && !isFinished) {
      if (stateShared.queryUsername.length > 0) {
        fetchUserMore();
      } else if (stateShared.queryUsername.length === 0 && clickedGQLTopic.queryTopic !== '' && state.filterBySeen) {
        fetchUserMore();
      }
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.page, axiosCancel.current]);

  useEffect(() => {
    if (location.pathname !== '/') {
      abortController.abort(); //cancel the fetch when the user go away from current page or when typing again to search
      axiosCancel.current = true;
    } else {
      axiosCancel.current = false; // back to default when in '/' path
    }
  }, [location, stateShared.queryUsername]);

  useEffect(() => {
    let isFinished = false;
    if (isTokenRSSExist && location.pathname === '/') {
      dispatchShared({
        type: 'TOKEN_RSS_ADDED',
        payload: {
          tokenRSS: userData.getUserData.tokenRSS,
        },
      });
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTokenRSSExist]);

  useEffect(() => {
    let isFinished = false;
    setNotification('');
    if (isSeenCardsExist && location.pathname === '/' && !isFinished && state.filterBySeen) {
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
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filterBySeen]);

  useEffect(() => {
    let isFinished = false;
    if (isSeenCardsExist && location.pathname === '/' && !isFinished && !state.filterBySeen) {
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
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seenDataLoading, seenDataError, seenData, location, state.filterBySeen]);

  useEffect(
    () => {
      let isFinished = false;
      if (isMergedDataExist && state.shouldFetchImages && location.pathname === '/' && !isFinished) {
        // state.mergedData.length > 0 && state.shouldFetchImages will execute after fetchUser() finish getting mergedData
        dispatch({
          type: 'SHOULD_IMAGES_DATA_ADDED',
          payload: {
            shouldFetchImages: false,
          },
        });
        const data = state.mergedData.reduce((acc, object) => {
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
        const promises: Promise<void>[] = [];
        const promisesImage: Promise<void>[] = [];
        data.forEach((obj) => {
          promises.push(
            new Promise((resolve, reject) => {
              (async () => {
                const response = await crawlerPython({
                  signal: abortController.signal,
                  data: obj,
                  topic: Array.isArray(stateShared.queryUsername)
                    ? stateShared.queryUsername[0]
                    : stateShared.queryUsername,
                  page: state.page,
                });
                const output = Object.assign(
                  {},
                  {
                    id: obj.id,
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
                resolve();
              })();
            })
          );
          promisesImage.push(
            new Promise((resolve, reject) => {
              (async () => {
                const response = await getRepoImages({
                  signal: abortController.signal,
                  data: obj,
                  topic: Array.isArray(stateShared.queryUsername)
                    ? stateShared.queryUsername[0]
                    : stateShared.queryUsername,
                  page: state.page,
                  axiosCancel: axiosCancel.current,
                });
                if (response.length > 0) {
                  dispatch({
                    type: 'IMAGES_DATA_ADDED',
                    payload: {
                      images: response,
                    },
                  });
                }
                resolve();
              })();
            })
          );
        });
        const doCrawler = async () => {
          await pMap(promises, (promise: Promise<void>) => promise?.then(noop), { concurrency: 5 });
          // while (promises.length) {
          //   // 3 concurrent request at at time (batch mode) but if there is two more queue items, it won't go immediately to fill the empty slot so need to use pMap
          //   await Promise.all(promises.splice(0, 3).map((f) => f.then(noop)));
          // }
        };
        const doFetchImages = async () => {
          await pMap(promisesImage, (promise: Promise<void>) => promise?.then(noop), {
            concurrency: promisesImage.length,
          });
        };
        doFetchImages()
          .then(noop)
          .catch((err) => {
            throw new Error(err);
          });
        doCrawler()
          .then(noop)
          .catch((err) => {
            throw new Error(err);
          });
        return () => {
          isFinished = true;
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.shouldFetchImages, isMergedDataExist, axiosCancel]
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
        <If condition={!isMergedDataExist}>
          <Then>
            <MasonryLoading data={whichToUse()} />
          </Then>
        </If>
        <If condition={isMergedDataExist}>
          <Then>
            <MasonryCard data={whichToUse()} getRootProps={getRootProps} />
            <ScrollToTopLayout />
          </Then>
        </If>
        <If condition={isLoading}>
          <Then>
            <LoadingEye queryUsername={stateShared.queryUsername} />
          </Then>
        </If>

        <If condition={notification}>
          <Then>
            <div style={{ textAlign: 'center' }}>
              <p>
                <a className={'underlining'} style={{ fontSize: '30px', color: 'black' }}>
                  {notification}
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
