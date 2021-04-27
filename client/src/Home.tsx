import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActionResolvePromiseOutput, IDataOne, IState, IStateShared } from './typing/interface';
import CardSkeleton from './HomeBody/CardSkeleton';
import { getOrg, getRepoImages, getSearchTopics, getUser, crawlerPython } from './services';
import MasonryLayout, { createRenderElement } from './Layout/MasonryLayout';
import _ from 'lodash';
import { useEventHandlerComposer, useResizeHandler } from './hooks/hooks';
import { ActionResolvedPromise, ImagesDataProps, MergedDataProps, Nullable, Seen, SeenProps } from './typing/type';
import Card from './HomeBody/Card';
import ScrollPositionManager from './util/scrollPositionSaver';
import { Then } from './util/react-if/Then';
import { If } from './util/react-if/If';
import clsx from 'clsx';
import useBottomHit from './hooks/useBottomHit';
import { Counter, fastFilter, isEqualObjects } from './util';
import useDeepCompareEffect from './hooks/useDeepCompareEffect';
import BottomNavigationBar from './HomeBody/BottomNavigationBar';
import { Helmet } from 'react-helmet';
import { useApolloFactory } from './hooks/useApolloFactory';
import { noop } from './util/util';
import eye from './new_16-2.gif';
import { useLocation } from 'react-router-dom';
import { useTrackedState, useTrackedStateShared, useTrackedStateStargazers } from './selectors/stateContextSelector';
import idx from 'idx';
import { Fab } from '@material-ui/core';
import { ScrollTopLayout } from './Layout/ScrollToTopLayout';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { Masonry } from './util/masonic/masonry';

// only re-render Card component when mergedData and idx changes
// Memo: given the same/always same props, always render the same output
// A common situation that makes a component render with the same props is being forced to render by a parent component.
interface MasonryLayoutMemo {
  children: any;
  data: MergedDataProps[];
  state: IState;
  stateShared: IStateShared;
  cardWidth?: number;
  gutter?: number;
}

// if you only include isEqualObjects(prevProps.mergedData.length, nextProps.mergedData.length) as
// propsAreEqual condition checker, the child of Masonry's Card won't get updated state like new tokenGQL when the user logged in using
// LoginGQL component from StargazersCard. We want to memoize masonry since it involves expensive DOM manipulation
const MasonryLayoutMemo = React.memo<MasonryLayoutMemo>(
  ({ children, data, state, stateShared, cardWidth = 370, gutter = 8 }) => {
    const columnCount = Math.floor(stateShared.width / (cardWidth + gutter)) || 1;
    return <MasonryLayout columns={columnCount}>{children(columnCount)}</MasonryLayout>;
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.data.length, nextProps.data.length) &&
      isEqualObjects(prevProps.stateShared.tokenGQL, nextProps.stateShared.tokenGQL) &&
      isEqualObjects(prevProps.stateShared.isLoggedIn, nextProps.stateShared.isLoggedIn) &&
      isEqualObjects(prevProps.state.imagesData, nextProps.state.imagesData) &&
      isEqualObjects(prevProps.stateShared.perPage, nextProps.stateShared.perPage) &&
      isEqualObjects(prevProps.stateShared.width, nextProps.stateShared.width)
    ); // when the component receives updated data from state such as load more, or clicked to login to access graphql
    // it needs to get re-render to get new data.
  }
);
MasonryLayoutMemo.displayName = 'MasonryLayoutMemo';

interface MasonryLayoutMemo {
  children: any;
  data: MergedDataProps[];
  state: IState;
  stateShared: IStateShared;
}
interface MasonryMemo extends MasonryLayoutMemo {
  getRootProps: any;
}
const MasonryMemo = React.memo<Omit<MasonryMemo, 'children'>>(
  ({ data, getRootProps }) => {
    return (
      <div className={'masonic'}>
        <Masonry
          items={data}
          args={{ getRootProps }}
          columnGutter={10}
          columnWidth={370}
          overscanBy={10}
          render={Card}
        />
      </div>
    );
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.data.length, nextProps.data.length) &&
      isEqualObjects(prevProps.stateShared.tokenGQL, nextProps.stateShared.tokenGQL) &&
      isEqualObjects(prevProps.stateShared.isLoggedIn, nextProps.stateShared.isLoggedIn) &&
      isEqualObjects(prevProps.state.imagesData, nextProps.state.imagesData) &&
      isEqualObjects(prevProps.stateShared.perPage, nextProps.stateShared.perPage) &&
      isEqualObjects(prevProps.stateShared.width, nextProps.stateShared.width)
    ); // when the component receives updated data from state such as load more, or clicked to login to access graphql
    // it needs to get re-render to get new data.
  }
);
MasonryMemo.displayName = 'MasonryMemo';
let axiosCancel = false;
const Home = React.memo<ActionResolvePromiseOutput>(({ actionResolvePromise }) => {
  const [state, dispatch] = useTrackedState();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [, dispatchStargazers] = useTrackedStateStargazers();
  const location = useLocation();
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
  const token = idx(userData, (_) => _.getUserData.token) || '';
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

    return newID.length > 0 && !(_.uniq([...oldID, ...newID]).length === oldID.length);
  };
  const isMergedDataExist = idx(state, (_) => _.mergedData.length > 0);
  const isSeenCardsExist = idx(seenData, (_) => _.getSeen.seenCards.length > 0 && !seenDataLoading && !seenDataError);
  const isTokenRSSExist = idx(userData, (_) => _.getUserData.tokenRSS.length > 0 && !userDataLoading && !userDataError);
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
          const ja = idx(state, (_) => _.repoStat.find((xx) => xx[0] === arr[0])) ?? [0, 0];
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
      token,
      axiosCancel,
    })
      .then((data: IDataOne) => {
        if (!!data && (data.error_404 || data.error_403)) {
          getOrg({
            signal: undefined,
            org: name,
            perPage: stateShared.perPage,
            page: state.page + 1,
            token,
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
          token: userDataRef.current!,
          axiosCancel,
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
        if (!Array.isArray(stateShared.username)) {
          userNameTransformed = [stateShared.username];
        } else {
          userNameTransformed = stateShared.username;
        }
        userNameTransformed.forEach((user) => {
          const temp = prefetch(user, axiosCancel);
          const clone = JSON.parse(JSON.stringify(dataPrefetch.current));
          actionController(clone, temp);
        });
        dataPrefetch.current = undefined;
      }
    }
  };
  const fetchUser = () => {
    setLoading(true);
    isFetchFinish.current = false;
    setNotification('');
    let userNameTransformed: string[];
    if (!Array.isArray(stateShared.username)) {
      userNameTransformed = [stateShared.username];
    } else {
      userNameTransformed = stateShared.username;
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
          axiosCancel,
          token,
        })
          .then((data: IDataOne) => {
            const callback = () =>
              getOrg({
                signal: abortController.signal,
                org: name,
                perPage: stateShared.perPage,
                page: 1,
                axiosCancel,
                token,
              })
                .then((data: IDataOne) => {
                  paginationInfo += data.paginationInfoData;
                  dispatch({
                    type: 'LAST_PAGE',
                    payload: {
                      lastPage: paginationInfo,
                    },
                  });
                  const temp = prefetch(name, axiosCancel);
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
            const temp = prefetch(name, axiosCancel);
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
  }, [state.mergedData]);

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/' && !isFinished) {
      isLoadingRef.current = isLoading;
      return () => {
        isFinished = true;
      };
    }
  }, [isLoading]);

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/' && !isFinished) {
      notificationRef.current = notification;
      return () => {
        isFinished = true;
      };
    }
  }, [notification]);

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/' && !isFinished) {
      imagesDataRef.current = state.imagesData;
      return () => {
        isFinished = true;
      };
    }
  }, [state.imagesData]);

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/' && !isFinished) {
      filterBySeenRef.current = state.filterBySeen;
      return () => {
        isFinished = true;
      };
    }
  }, [state.filterBySeen]);

  const handleBottomHit = useCallback(() => {
    if (
      !isFetchFinish.current &&
      mergedDataRef.current.length > 0 &&
      !isLoadingRef.current &&
      location.pathname === '/' &&
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
            stargazers_count: obj.stargazers_count,
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
            imagesData:
              idx(imagesDataRef.current, (_) => _.filter((xx) => xx.id === obj.id).map((obj) => [...obj.value])[0]) ??
              [],
            name: obj.name,
            is_queried: false,
          }
        );
        acc.push(temp);
        return acc;
      }, [] as MergedDataProps[]);
      if (result.length > 0 && imagesDataRef.current.length > 0 && stateShared.isLoggedIn) {
        seenAdded({
          variables: {
            seenCards: result,
          },
        }).then(noop);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateShared.isLoggedIn]);

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
    if (stateShared.username.length > 0 && state.mergedData.length === 0 && location.pathname === '/' && !isFinished) {
      // we want to preserve stateShared.username so that when the user navigate away from Home, then go back again, and do the scroll again,
      // we still want to retain the memory of username so that's why we use reducer of stateShared.username.
      // However, as the component unmount, stateShared.username is not "", thus causing fetchUser to fire in useEffect
      // to prevent that, use state.mergedData.length === 0 so that when it's indeed 0, that means no data anything yet so need to fetch first time
      // otherwise, don't re-fetch. in this way, stateShared.username and state.mergedData are still preserved
      fetchUser();
      return () => {
        isFinished = true;
      };
    }
    // when you type google in SearchBar.js, then perPage=10, you can fetch. then when you change perPage=40 and type google again
    // it cannot fetch because if the dependency array of fetchUser() is only [stateShared.username] so stateShared.username not change so not execute
    // so you need another dependency of stateShared.perPage
    // you also need state.mergedData because on submit in SearchBar.js, you specify dispatchMergedData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateShared.username, stateShared.perPage, state.mergedData, axiosCancel]);

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/' && !isFinished) {
      if (stateShared.username.length > 0) {
        fetchUserMore();
      } else if (stateShared.username.length === 0 && clickedGQLTopic.queryTopic !== '' && state.filterBySeen) {
        fetchUserMore();
      }
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.page, axiosCancel]);

  useEffect(() => {
    if (location.pathname !== '/') {
      abortController.abort(); //cancel the fetch when the user go away from current page or when typing again to search
      axiosCancel = true;
    } else {
      axiosCancel = false; // back to default when in '/' path
    }
  }, [location.pathname, stateShared.username]);

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
      const images = temp!.reduce((acc: any[], obj: Seen) => {
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
  }, [seenDataLoading, seenDataError, seenData, location.pathname, state.filterBySeen]);

  useEffect(
    () => {
      let isFinished = false;
      if (isMergedDataExist && state.shouldFetchImages && location.pathname === '/' && !isFinished) {
        // state.mergedData.length > 0 && state.shouldFetchImages will execute after fetchUser() finish getting mergedData
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
        const doCrawler = async () => {
          for (let i = 0; i < data.length; i++) {
            const obj = data[i];
            const response = await crawlerPython({
              signal: abortController.signal,
              data: obj,
              topic: Array.isArray(stateShared.username) ? stateShared.username[0] : stateShared.username,
              page: state.page,
              axiosCancel,
              token,
            });

            console.log(response);
          }
        };
        const fetchData = async () => {
          const response = await getRepoImages({
            signal: abortController.signal,
            data,
            topic: Array.isArray(stateShared.username) ? stateShared.username[0] : stateShared.username,
            page: state.page,
            token,
            axiosCancel,
          });
          const reader = response!.body!.getReader();
          const td = new TextDecoder('utf-8');
          while (true) {
            const { value, done } = await reader!.read();
            if (done) break;
            const decoded = JSON.parse(td.decode(value));
            if (decoded.renderImages.length > 0) {
              dispatch({
                type: 'SHOULD_IMAGES_DATA_ADDED',
                payload: {
                  shouldFetchImages: false,
                },
              });
              dispatch({
                type: 'IMAGES_DATA_ADDED',
                payload: {
                  images: decoded.renderImages,
                },
              });
            }
          }
        };
        // fetchData().then(noop);
        doCrawler()
          .then(noop)
          .catch((err) => {
            console.log(err);
          });
        return () => {
          isFinished = true;
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.shouldFetchImages, isMergedDataExist, axiosCancel]
  );

  const userDataRef = useRef<string>();
  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/') {
      userDataRef.current = token;
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onClickTopic = useCallback(
    async ({ variables }) => {
      if (stateShared.tokenGQL !== '' && userDataRef.current && state.filterBySeen) {
        setLoading(true);
        dispatch({
          type: 'REMOVE_ALL',
        });
        dispatchStargazers({
          type: 'REMOVE_ALL',
        });
        dispatchShared({
          type: 'USERNAME_ADDED',
          payload: {
            username: '',
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
          token: userDataRef.current!,
          axiosCancel,
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
    [stateShared.tokenGQL, userDataRef.current, state.filterBySeen, axiosCancel] // if not specified, stateShared.tokenGQL !== '' will always true when you click it again, even though stateShared.tokenGQL already updated
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

  // TODO: put the color of each card to change as the user scroll to the bottom to see it: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
  // and put delay at each Card so that as if the animation is at random

  // TODO: show related topics that you get from queries.ts

  // TODO: sortable cards based on topics, and when clicked to the topic section
  // it should show effect: https://codyhouse.co/ds/components/app/looping-tabs

  //TODO: handle the case where the user revoke his token

  //TODO: disable inspect element when in production

  //TODO: show the history of the user + statistic of what languages they browse

  //TODO: test brutal requests the reslience of handling requests

  //TODO: icon of website when there's URL in the description scrapped using https://github.com/danielmiessler/GitHubRating/blob/master/GitHubRating.sh (curl)

  //TODO: create button on card: "Do you want the stargazers to be analyzed?" and will display the most relevant users' repos showed in "Discover" section

  //TODO: show all function in code base and where it uses the function. need to differentiate between returning jsx and not returning jsx

  //TODO: https://github.com/developit/redaxios https://github.com/asilvas/node-image-steam,
  // https://github.com/postlight/mercury-parser/blob/master/src/extractors/custom/github.com/index.js,
  // https://swc.rs/docs/usage-swc-loader

  //TODO: after Details is rendered, show related repo from author and contributors sorted based on stargazers.

  //TODO: if the user is new, guide them using https://shepherdjs.dev/
  return (
    <React.Fragment>
      <Helmet>
        <title>Github Fetcher Dashboard</title>
        <meta charSet={'utf-8'} />
        <meta
          name="description"
          content="Improving Github search and discover experience with an enhanced user-interface and functionalities"
        />
      </Helmet>
      {/*we want ScrollPositionManager to be unmounted when router changes because the way it works is to save scroll position
       when unmounted*/}
      <ScrollPositionManager scrollKey="home" />
      <div className={'top'} />
      <div
        ref={windowScreenRef}
        className={clsx('', {
          header: isMergedDataExist,
        })}
        style={{ marginLeft: `${stateShared.drawerWidth > 0 ? 170 : 50}px`, zIndex: state.visible ? -1 : 0 }}
      >
        {
          // we want to render Card first and ImagesCard later because it requires more bandwith
          // so no need to use state.imagesData condition on top of state.mergedData?.length > 0 && !shouldRenderSkeleton
          // below, otherwise it's going to slow to wait for ImagesCard as the Card won't get re-render instantly consequently
        }
        <If condition={!state.filterBySeen && isSeenCardsExist}>
          <Then>
            <div style={{ textAlign: 'center' }}>
              <h3>Your {idx(seenData, (_) => _.getSeen.seenCards.length)} Card History:</h3>
            </div>
          </Then>
        </If>
        <If condition={isMergedDataExist}>
          <Then>
            <MasonryMemo data={whichToUse()} getRootProps={getRootProps} state={state} stateShared={stateShared} />
          </Then>
        </If>
        <If condition={!isMergedDataExist}>
          <Then>
            <MasonryLayoutMemo data={whichToUse()} state={state} stateShared={stateShared}>
              {() => {
                return Object.keys(state.mergedData).map((_, idx) => createRenderElement(CardSkeleton, { key: idx }));
              }}
            </MasonryLayoutMemo>
          </Then>
        </If>

        <If condition={isLoading}>
          <Then>
            <div style={{ textAlign: 'center' }}>
              <img src={eye} style={{ width: '100px' }} />
              <div style={{ textAlign: 'center' }}>
                <h3>
                  Please wait while fetching your query of:{' '}
                  <p>
                    <a className={'underlining'}>
                      {Array.isArray(stateShared.username) && stateShared.username.length > 0
                        ? stateShared.username.join(', ')
                        : stateShared.username}
                    </a>
                  </p>
                </h3>
              </div>
            </div>
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
      <ScrollTopLayout>
        <Fab color="secondary" size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon style={{ transform: 'scale(1.5)' }} />
        </Fab>
      </ScrollTopLayout>
      <If condition={stateShared.width > 1100}>
        <Then>{createRenderElement(BottomNavigationBar, {})}</Then>
      </If>
    </React.Fragment>
  );
});
Home.displayName = 'Home';
export default Home;
