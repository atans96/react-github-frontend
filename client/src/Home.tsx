import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActionResolvePromiseOutput, IDataOne } from './typing/interface';
import { useTrackedState, useTrackedStateShared, useTrackedStateStargazers } from './selectors/stateContextSelector';
import { useApolloFactory } from './hooks/useApolloFactory';
import { ActionResolvedPromise, ImagesDataProps, MergedDataProps, Nullable, SeenProps } from './typing/type';
import { noop } from './util/util';
import { Counter, fastFilter, pMap } from './util';
import { crawlerPython, getOrg, getRepoImages, getSearchTopics, getUser } from './services';
import useBottomHit from './hooks/useBottomHit';
import { useEventHandlerComposer, useResizeHandler } from './hooks/hooks';
import useDeepCompareEffect from './hooks/useDeepCompareEffect';
import { useScrollSaver } from './hooks/useScrollSaver';
import clsx from 'clsx';
import { If } from './util/react-if/If';
import { Then } from './util/react-if/Then';
import { loadable } from './loadable';
import { createRenderElement } from './Layout/MasonryLayout';
interface MasonryMemo {
  getRootProps: any;
  data: MergedDataProps[];
}
interface MasonryLoading {
  data: MergedDataProps[];
  cardWidth?: number;
  gutter?: number;
}
interface LoadingEye {
  queryUsername: string[] | string;
}
const MasonryCard = (condition: boolean, args: MasonryMemo) =>
  loadable({
    importFn: () => import('./HomeBody/MasonryCard').then((module) => createRenderElement(module.default, { ...args })),
    cacheId: 'MasonryCardHome',
    condition: condition,
    empty: () => <></>,
  });
const MasonryLoading = (condition: boolean, args: MasonryLoading) =>
  loadable({
    importFn: () => import('./HomeBody/MasonryLoading').then((module) => module.default({ ...args })),
    cacheId: 'MasonryLoading',
    condition: condition,
    empty: () => <></>,
  });
const LoadingEye = (condition: boolean, args: LoadingEye) =>
  loadable({
    importFn: () => import('./LoadingEye').then((module) => module.default({ ...args })),
    cacheId: 'LoadingEye',
    condition: condition,
    empty: () => <></>,
  });
const BottomNavigationBar = (condition: boolean) =>
  loadable({
    importFn: () => import('./HomeBody/BottomNavigationBar').then((module) => createRenderElement(module.default, {})),
    cacheId: 'BottomNavigationBar',
    condition: condition,
    empty: () => <></>,
  });
const ScrollToTopLayout = (condition: boolean) =>
  loadable({
    importFn: () => import('./Layout/ScrollToTopLayout'),
    cacheId: 'ScrollToTopLayoutHome',
    condition: condition,
    empty: () => <></>,
  });

const Home: React.FC<ActionResolvePromiseOutput> = ({ actionResolvePromise, location }) => {
  const axiosCancel = useRef<boolean>(false);
  const [state, dispatch] = useTrackedState();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [, dispatchStargazers] = useTrackedStateStargazers();
  const abortController = new AbortController();
  const displayName: string | undefined = (Home as React.ComponentType<any>).displayName;
  const { seenData, seenDataLoading, seenDataError } = useApolloFactory(displayName!).query.getSeen();
  const { userData, userDataLoading, userDataError } = useApolloFactory(displayName!).query.getUserData();
  const seenAdded = useApolloFactory(displayName!).mutation.seenAdded;
  // useState is used when the HTML depends on it directly to render something
  const [isLoading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [clickedGQLTopic, setGQLTopic] = useState({
    variables: '',
  } as any);
  // useRef will assign a reference for each component, while a variable defined outside a function component will only be called once.
  // so don't use let page=1 outside of Home component. useRef makes sure same reference is returned during each render while it won't cause re-render
  // https://stackoverflow.com/questions/57444154/why-need-useref-to-contain-mutable-variable-but-not-define-variable-outside-the
  const isFetchFinish = useRef(false); // indicator to stop fetching when we have no more data
  const windowScreenRef = useRef<HTMLDivElement>(null);
  const isDataExists = (data: Nullable<IDataOne>) => {
    if (data === undefined || data?.dataOne === undefined) {
      return [[], []];
    }
    const oldID: number[] = [];
    const newID: number[] = [];
    state.mergedData.map((obj) => {
      return oldID.push(obj.id);
    });
    data.dataOne.map((obj: MergedDataProps) => {
      return newID.push(obj.id);
    });

    return newID.length > 0 && !([...new Set([...oldID, ...newID])].length === oldID.length);
  };
  const isMergedDataExist = state.mergedData.length > 0;
  const isSeenCardsExist =
    (seenData?.getSeen?.seenCards && seenData.getSeen.seenCards.length > 0 && !seenDataLoading && !seenDataError) ||
    false;
  const isTokenRSSExist = userData?.getUserData?.tokenRSS?.length > 0 && !userDataLoading && !userDataError;
  const isFunction = (value: () => void) =>
    value && (Object.prototype.toString.call(value) === '[object Function]' || 'function' === typeof value || true)
      ? value()
      : new Error('Not valid function!');

  const actionController = (res: IDataOne, prefetch = noop, callback?: Promise<any> | any) => {
    // compare new with old data, if they differ, that means it still has data to fetch
    const promiseOrNot = () => {
      callback() instanceof Promise && res !== undefined && (res.error_404 || res.error_403)
        ? callback()
        : isFunction(callback);
    };
    if (isDataExists(res)) {
      const ja = Counter(res.dataOne, 'language');
      const repoStat = Object.entries(ja)
        .slice(0, 5)
        .map((arr: any) => {
          const ja = state.repoStat.find((xx) => xx[0] === arr[0]) || [0, 0];
          return [arr[0], ja[1] + arr[1]];
        });
      dispatch({
        type: 'SHOULD_IMAGES_DATA_ADDED',
        payload: {
          shouldFetchImages: true,
        },
      });
      dispatch({
        type: 'REPO_STAT',
        payload: {
          repoStat: repoStat,
        },
      });
      actionResolvePromise({
        action: ActionResolvedPromise.append,
        setLoading,
        setNotification,
        isFetchFinish: isFetchFinish.current,
        displayName: displayName!,
        data: res,
        prefetch,
      });
    } else if (res !== undefined && (res.error_404 || res.error_403)) {
      callback
        ? promiseOrNot()
        : actionResolvePromise({
            action: ActionResolvedPromise.error,
            setLoading,
            setNotification,
            isFetchFinish: isFetchFinish.current,
            displayName: displayName!,
            data: res,
          });
    } else {
      isFetchFinish.current = actionResolvePromise({
        action: ActionResolvedPromise.noData,
        setLoading,
        setNotification,
        isFetchFinish: isFetchFinish.current,
        displayName: displayName!,
        data: res,
      }).isFetchFinish;
    }
  };
  const dataPrefetch = useRef<IDataOne | undefined>();
  const prefetch = (name: string, axiosCancel: boolean) => () => {
    getUser({
      signal: undefined,
      username: name,
      perPage: stateShared.perPage,
      page: state.page + 1,
      axiosCancel,
    })
      .then((data: IDataOne) => {
        if (!!data && (data.error_404 || data.error_403)) {
          getOrg({
            signal: undefined,
            org: name,
            perPage: stateShared.perPage,
            page: state.page + 1,
            axiosCancel,
          })
            .then((data: IDataOne) => {
              dataPrefetch.current = data;
            })
            .catch((error) => {
              actionResolvePromise({
                action: ActionResolvedPromise.error,
                setLoading,
                setNotification,
                isFetchFinish: isFetchFinish.current,
                displayName: displayName!,
                error,
              });
            });
        } else {
          dataPrefetch.current = data;
        }
      })
      .catch((error) => {
        actionResolvePromise({
          action: ActionResolvedPromise.error,
          setLoading,
          setNotification,
          isFetchFinish: isFetchFinish.current,
          displayName: displayName!,
          error,
        });
      });
  };
  const fetchUserMore = () => {
    // we want to preserve state.page so that when the user navigate away from Home, then go back again, we still want to retain state.page
    // so when they scroll again, it will fetch the correct next page. However, as the user already scroll, it causes state.page > 1
    // thus when they navigate away and go back again to Home, this will hit again, thus causing re-fetching the same data.
    // to prevent that, we need to reset the Home.js is unmounted.
    if (!isFetchFinish.current && state.page > 1) {
      // it's possible the user click Details.js and go back to Home.js again and find out that
      // that the previous page.current is already 2, but when he/she navigates aways from Home.js, it go back to page.current=1 again
      // so the scroll won't get fetch immediately. Thus, we need to persist state.page using reducer
      setLoading(true); // spawn loading spinner at bottom page
      setNotification('');
      if (clickedGQLTopic.queryTopic !== undefined) {
        getSearchTopics({
          signal: abortController.signal,
          topic: clickedGQLTopic.queryTopic,
          axiosCancel: axiosCancel.current,
        })
          .then((res: IDataOne) => {
            actionController(res);
          })
          .catch((error) => {
            actionResolvePromise({
              action: ActionResolvedPromise.error,
              setLoading,
              setNotification,
              isFetchFinish: isFetchFinish.current,
              error: error,
              displayName: displayName!,
            });
          });
      } else if (dataPrefetch.current && dataPrefetch.current.dataOne.length > 0) {
        let userNameTransformed: string[];
        if (!Array.isArray(stateShared.queryUsername)) {
          userNameTransformed = [stateShared.queryUsername];
        } else {
          userNameTransformed = stateShared.queryUsername;
        }
        userNameTransformed.forEach((user) => {
          const temp = prefetch(user, axiosCancel.current);
          const clone = JSON.parse(JSON.stringify(dataPrefetch.current));
          actionController(clone, temp);
        });
        dataPrefetch.current = undefined;
      }
    }
  };
  const mergedDataRef = useRef<MergedDataProps[]>([]);
  const isLoadingRef = useRef<boolean>(false);
  const imagesDataRef = useRef<ImagesDataProps[]>([]);
  const filterBySeenRef = useRef<boolean>(state.filterBySeen);
  const notificationRef = useRef<string>('');

  useEffect(() => {
    let isFinished = false;
    if (location === '/' && !isFinished) {
      mergedDataRef.current = state.mergedData;
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mergedData]);

  useEffect(() => {
    let isFinished = false;
    if (location === '/' && !isFinished) {
      isLoadingRef.current = isLoading;
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    let isFinished = false;
    if (location === '/' && !isFinished) {
      notificationRef.current = notification;
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification]);

  useEffect(() => {
    let isFinished = false;
    if (location === '/' && !isFinished) {
      imagesDataRef.current = state.imagesData;
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.imagesData]);

  useEffect(() => {
    let isFinished = false;
    if (location === '/' && !isFinished) {
      filterBySeenRef.current = state.filterBySeen;
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filterBySeen]);

  const locationRef = useRef('/');
  useEffect(() => {
    locationRef.current = location;
  });
  const fetchUser = () => {
    setLoading(true);
    isFetchFinish.current = false;
    setNotification('');
    let userNameTransformed: string[];
    if (!Array.isArray(stateShared.queryUsername)) {
      userNameTransformed = [stateShared.queryUsername];
    } else {
      userNameTransformed = stateShared.queryUsername;
    }
    const promises: Promise<void>[] = [];
    let paginationInfo = 0;
    userNameTransformed.forEach((name) => {
      promises.push(
        getUser({
          signal: abortController.signal,
          username: name,
          perPage: stateShared.perPage,
          page: 1,
          axiosCancel: axiosCancel.current,
        })
          .then((data: IDataOne) => {
            const callback = () =>
              getOrg({
                signal: abortController.signal,
                org: name,
                perPage: stateShared.perPage,
                page: 1,
                axiosCancel: axiosCancel.current,
              })
                .then((data: IDataOne) => {
                  paginationInfo += data.paginationInfoData;
                  dispatch({
                    type: 'LAST_PAGE',
                    payload: {
                      lastPage: paginationInfo,
                    },
                  });
                  const temp = prefetch(name, axiosCancel.current);
                  actionController(data, temp);
                })
                .catch((error) => {
                  actionResolvePromise({
                    action: ActionResolvedPromise.error,
                    setLoading,
                    setNotification,
                    isFetchFinish: isFetchFinish.current,
                    displayName: displayName!,
                    error,
                  });
                });
            paginationInfo += data.paginationInfoData;
            dispatch({
              type: 'LAST_PAGE',
              payload: {
                lastPage: paginationInfo,
              },
            });
            const temp = prefetch(name, axiosCancel.current);
            actionController(data, temp, callback);
          })
          .catch((error) => {
            actionResolvePromise({
              action: ActionResolvedPromise.error,
              setLoading,
              setNotification,
              isFetchFinish: isFetchFinish.current,
              displayName: displayName!,
              error,
            });
          })
      );
    });
    promises.forEach((promise) => promise.then(noop));
  };

  const handleBottomHit = useCallback(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stateShared.isLoggedIn,
    isFetchFinish.current,
    mergedDataRef.current.length,
    isLoadingRef.current,
    notificationRef.current,
    filterBySeenRef.current,
    locationRef.current,
  ]);

  useBottomHit(
    windowScreenRef,
    handleBottomHit,
    isLoading || !isMergedDataExist || isFetchFinish.current // include isFetchFinish to indicate not to listen anymore
  );

  function handleResize() {
    dispatchShared({
      type: 'SET_WIDTH',
      payload: {
        width: window.innerWidth,
      },
    });
  }

  useResizeHandler(windowScreenRef, handleResize);

  useDeepCompareEffect(() => {
    let isFinished = false;
    // when the username changes, that means the user submit form at SearchBar.js + dispatchMergedData([]) there
    if (stateShared.queryUsername.length > 0 && state.mergedData.length === 0 && location === '/' && !isFinished) {
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
    if (location === '/' && !isFinished) {
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
    if (location !== '/') {
      abortController.abort(); //cancel the fetch when the user go away from current page or when typing again to search
      axiosCancel.current = true;
    } else {
      axiosCancel.current = false; // back to default when in '/' path
    }
  }, [location, stateShared.queryUsername]);

  useEffect(() => {
    let isFinished = false;
    if (isTokenRSSExist && location === '/') {
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
    if (isSeenCardsExist && location === '/' && !isFinished && state.filterBySeen) {
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
    if (isSeenCardsExist && location === '/' && !isFinished && !state.filterBySeen) {
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
      if (isMergedDataExist && state.shouldFetchImages && location === '/' && !isFinished) {
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

  const onClickTopic = useCallback(
    async ({ variables }) => {
      if (stateShared.tokenGQL !== '' && state.filterBySeen) {
        setLoading(true);
        dispatch({
          type: 'REMOVE_ALL',
        });
        dispatchStargazers({
          type: 'REMOVE_ALL',
        });
        dispatchShared({
          type: 'QUERY_USERNAME',
          payload: {
            queryUsername: '',
          },
        });
        isFetchFinish.current = false;
        setNotification('');
        setGQLTopic({
          variables,
        });
        let paginationInfo = 0;
        return getSearchTopics({
          signal: abortController.signal,
          topic: variables.queryTopic,
          axiosCancel: axiosCancel.current,
        })
          .then((result: IDataOne) => {
            paginationInfo += result.paginationInfoData;
            dispatch({
              type: 'LAST_PAGE',
              payload: {
                lastPage: paginationInfo,
              },
            });
            actionController(result);
          })
          .catch((error) => {
            actionResolvePromise({
              action: ActionResolvedPromise.error,
              setLoading,
              setNotification,
              isFetchFinish: isFetchFinish.current,
              displayName: displayName!,
              error,
            });
          });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stateShared.tokenGQL, state.filterBySeen, axiosCancel] // if not specified, stateShared.tokenGQL !== '' will always true when you click it again, even though stateShared.tokenGQL already updated
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
  useScrollSaver(location, '/');
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
        {MasonryCard(isMergedDataExist, { data: whichToUse(), getRootProps })}

        {MasonryLoading(!isMergedDataExist, { data: whichToUse() })}

        {LoadingEye(isLoading, { queryUsername: stateShared.queryUsername })}

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
      {ScrollToTopLayout(isMergedDataExist)}

      {BottomNavigationBar(stateShared.width > 1100)}
    </React.Fragment>
  );
};
Home.displayName = 'Home';
export default Home;
