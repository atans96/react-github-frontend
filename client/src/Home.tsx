import React, { useEffect, useRef, useState } from 'react';
import { useApolloFactory } from './hooks/useApolloFactory';
import { MergedDataProps, SeenProps } from './typing/type';
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
import { SharedStore } from './store/Shared/reducer';
import { HomeStore } from './store/Home/reducer';

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

const Home = React.memo(() => {
  const {
    fetchUserMore,
    fetchUser,
    isLoading,
    notification,
    setNotification,
    onClickTopic,
    clickedGQLTopic,
    isFetchFinish,
  } = useFetchUser({ component: 'Home' });
  const location = useLocation();
  const axiosCancel = useRef<boolean>(false);
  const abortController = new AbortController();
  const displayName: string | undefined = (Home as React.ComponentType<any>).displayName;
  const { seenData, seenDataLoading, seenDataError } = useApolloFactory(displayName!).query.getSeen();
  const { userData, userDataLoading, userDataError } = useApolloFactory(displayName!).query.getUserData();
  const seenAdded = useApolloFactory(displayName!).mutation.seenAdded;
  // useRef will assign a reference for each component, while a variable defined outside a function component will only be called once.
  // so don't use let page=1 outside of Home component. useRef makes sure same reference is returned during each render while it won't cause re-render
  // https://stackoverflow.com/questions/57444154/why-need-useref-to-contain-mutable-variable-but-not-define-variable-outside-the
  const windowScreenRef = useRef<HTMLDivElement>(null);
  const { mergedData } = HomeStore.store().MergedData();
  const { imagesData } = HomeStore.store().ImagesData();
  const { undisplayMergedData } = HomeStore.store().UndisplayMergedData();
  const { shouldFetchImages } = HomeStore.store().ShouldFetchImages();
  const { page } = HomeStore.store().Page();
  const { visible } = HomeStore.store().Visible();
  const { filterBySeen } = HomeStore.store().FilterBySeen();
  const { filteredMergedData } = HomeStore.store().FilteredMergedData();

  const { isLoggedIn } = SharedStore.store().IsLoggedIn();
  const { perPage } = SharedStore.store().PerPage();
  const { queryUsername } = SharedStore.store().QueryUsername();
  const { drawerWidth } = SharedStore.store().DrawerWidth();
  const { width } = SharedStore.store().Width();
  const isMergedDataExist = mergedData.length > 0;
  const isSeenCardsExist =
    (seenData?.getSeen?.seenCards && seenData.getSeen.seenCards.length > 0 && !seenDataLoading && !seenDataError) ||
    false;
  const isTokenRSSExist = userData?.getUserData?.tokenRSS?.length > 0 && !userDataLoading && !userDataError;

  const handleBottomHit = useStableCallback(() => {
    if (
      !isFetchFinish &&
      mergedData.length > 0 &&
      !isLoading &&
      location.pathname === '/' &&
      notification === '' &&
      filterBySeen
    ) {
      HomeStore.dispatch({
        type: 'ADVANCE_PAGE',
      });
      const result = mergedData.reduce((acc, obj: MergedDataProps) => {
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
            imagesData: imagesData.filter((xx) => xx.id === obj.id).map((obj) => [...obj.value])[0] || [],
            name: obj.name,
            is_queried: false,
          }
        );
        acc.push(temp);
        return acc;
      }, [] as SeenProps[]);
      if (result.length > 0 && imagesData.length > 0 && isLoggedIn) {
        seenAdded(result).then(noop);
      }
    }
  });

  useBottomHit(
    windowScreenRef,
    handleBottomHit,
    isLoading || !isMergedDataExist || isFetchFinish // include isFetchFinish to indicate not to listen anymore
  );

  useResizeObserver(windowScreenRef, (entry: any) => {
    if (width !== entry.contentRect.width) {
      SharedStore.dispatch({
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
    if (queryUsername.length > 0 && mergedData.length === 0 && location.pathname === '/' && !isFinished) {
      // we want to preserve queryUsername so that when the user navigate away from Home, then go back again, and do the scroll again,
      // we still want to retain the memory of username so that's why we use reducer of queryUsername.
      // However, as the component unmount, queryUsername is not "", thus causing fetchUser to fire in useEffect
      // to prevent that, use mergedData.length === 0 so that when it's indeed 0, that means no data anything yet so need to fetch first time
      // otherwise, don't re-fetch. in this way, queryUsername and mergedData are still preserved
      fetchUser();
      return () => {
        isFinished = true;
      };
    }
    // when you type google in SearchBar.js, then perPage=10, you can fetch. then when you change perPage=40 and type google again
    // it cannot fetch because if the dependency array of fetchUser() is only [queryUsername] so queryUsername not change so not execute
    // so you need another dependency of SharedStore.PerPage.perPage
    // you also need mergedData because on submit in SearchBar.js, you specify dispatchMergedData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryUsername, perPage, mergedData, axiosCancel.current]);

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/' && !isFinished) {
      if (queryUsername.length > 0) {
        fetchUserMore();
      } else if (queryUsername.length === 0 && clickedGQLTopic.queryTopic !== '' && filterBySeen) {
        fetchUserMore();
      }
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, axiosCancel.current]);

  useEffect(() => {
    if (location.pathname !== '/') {
      abortController.abort(); //cancel the fetch when the user go away from current page or when typing again to search
      axiosCancel.current = true;
    } else {
      axiosCancel.current = false; // back to default when in '/' path
    }
  }, [location, queryUsername]);

  useEffect(() => {
    let isFinished = false;
    if (isTokenRSSExist && location.pathname === '/') {
      SharedStore.dispatch({
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
    if (isSeenCardsExist && location.pathname === '/' && !isFinished && filterBySeen) {
      const ids = undisplayMergedData.reduce((acc, obj) => {
        acc.push(obj.id);
        return acc;
      }, [] as number[]);
      const temp = fastFilter((obj: MergedDataProps) => !ids.includes(obj.id), mergedData);
      const images = fastFilter((image: Record<string, any>) => !ids.includes(image.id), imagesData);
      HomeStore.dispatch({
        type: 'IMAGES_DATA_REPLACE',
        payload: {
          imagesData: images,
        },
      });
      HomeStore.dispatch({
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
  }, [filterBySeen]);

  useEffect(() => {
    let isFinished = false;
    if (isSeenCardsExist && location.pathname === '/' && !isFinished && !filterBySeen) {
      HomeStore.dispatch({
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
      HomeStore.dispatch({
        type: 'IMAGES_DATA_ADDED',
        payload: {
          images: images,
        },
      });
      HomeStore.dispatch({
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
  }, [seenDataLoading, seenDataError, seenData, location, filterBySeen]);

  useEffect(
    () => {
      let isFinished = false;
      if (isMergedDataExist && shouldFetchImages && location.pathname === '/' && !isFinished) {
        // mergedData.length > 0 && HomeStore.store.ShouldFetchImages.shouldFetchImages will execute after fetchUser() finish getting mergedData
        HomeStore.dispatch({
          type: 'SHOULD_IMAGES_DATA_ADDED',
          payload: {
            shouldFetchImages: false,
          },
        });
        const data = mergedData.reduce((acc, object) => {
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
                  topic: Array.isArray(queryUsername) ? (queryUsername[0] as string) : (queryUsername as string),
                  page: page,
                });
                if (response) {
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
                  HomeStore.dispatch({
                    type: 'SET_CARD_ENHANCEMENT',
                    payload: {
                      cardEnhancement: output,
                    },
                  });
                  resolve();
                } else {
                  reject('fail');
                }
              })().catch((err) => {
                console.error(err);
              });
            })
          );
          promisesImage.push(
            new Promise((resolve, reject) => {
              (async () => {
                const response = await getRepoImages({
                  signal: abortController.signal,
                  data: obj,
                  topic: Array.isArray(queryUsername) ? (queryUsername[0] as string) : (queryUsername as string),
                  page: page,
                  axiosCancel: axiosCancel.current,
                });
                if (response && response.length > 0) {
                  HomeStore.dispatch({
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
    [shouldFetchImages, isMergedDataExist, axiosCancel]
  );
  const { getRootProps } = useEventHandlerComposer({ onClickCb: onClickTopic });

  const whichToUse = () => {
    // useCallback will avoid unnecessary child re-renders due to something changing in the parent that
    // is not part of the dependencies for the callback.
    if (filteredMergedData.length > 0) {
      return filteredMergedData;
    }
    return mergedData; // return this if filteredTopics.length === 0
  };
  useScrollSaver(location.pathname, '/');
  const [renderLoading, setRenderLoading] = useState(false);
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        if (isLoading) {
          setRenderLoading(isLoading);
        }
      }, 1000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [isLoading]);
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
          marginLeft: `${drawerWidth > 0 ? 170 : 50}px`,
          zIndex: visible ? -1 : 0,
        }}
      >
        {
          // we want to render Card first and ImagesCard later because it requires more bandwith
          // so no need to use state.imagesData condition on top of mergedData?.length > 0 && !shouldRenderSkeleton
          // below, otherwise it's going to slow to wait for ImagesCard as the Card won't get re-render instantly consequently
        }
        <If condition={!filterBySeen && isSeenCardsExist}>
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

        {isLoading && renderLoading && <LoadingEye queryUsername={queryUsername} />}

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
      {width > 1100 && <BottomNavigationBar />}
    </React.Fragment>
  );
});
Home.displayName = 'Home';
export default Home;
