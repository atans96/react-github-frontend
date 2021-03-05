import React, { useCallback, useEffect, useRef, useState } from 'react';
import CardSkeleton from './HomeBody/CardSkeleton';
import { getOrg, getRepoImages, getSearchTopics, getUser } from './services';
import MasonryLayout from './Layout/MasonryLayout';
import _ from 'lodash';
import {
  dispatchAppendMergedData,
  dispatchImagesData,
  dispatchLastPage,
  dispatchMergedData,
  dispatchPage,
  dispatchShouldFetchImagesData,
  dispatchUsername,
} from './store/dispatcher';
import { useEventHandlerComposer, useResizeHandler } from './hooks/hooks';
import { IDataOne, IState, IStateStargazers } from './typing/interface';
import { MergedDataProps, Nullable, SeenProps } from './typing/type';
import Card from './HomeBody/Card';
import ScrollPositionManager from './util/scrollPositionSaver';
import { Then } from './util/react-if/Then';
import { If } from './util/react-if/If';
import { filterActionResolvedPromiseData } from './util/util';
import clsx from 'clsx';
import useBottomHit from './hooks/useBottomHit';
import { isEqualObjects } from './util';
import useDeepCompareEffect from './hooks/useDeepCompareEffect';
import BottomNavigationBar from './HomeBody/BottomNavigationBar';
import { RouteComponentProps } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import useApolloFactory from './hooks/useApolloFactory';
// only re-render Card component when mergedData and idx changes
// Memo: given the same/always same props, always render the same output
// A common situation that makes a component render with the same props is being forced to render by a parent component.
interface MasonryLayoutMemo {
  children: any;
  data: IState['mergedData'];
  state: IState;
}

// const screenWidth = (width) => {
//   if (1)
// }
// if you only include isEqualObjects(prevProps.mergedData.length, nextProps.mergedData.length) as
// propsAreEqual condition checker, the child of Masonry's Card won't get updated state like new tokenGQL when the user logged in using
// LoginGQL component from StargazersCard. We want to memoize masonry since it involves expensive DOM manipulation
const MasonryLayoutMemo = React.memo<MasonryLayoutMemo>(
  ({ children, data, state }) => {
    let columnCount = state.width < 760 ? 1 : 2;
    let increment = 300;
    let baseWidth = 760;
    if (state.width > 760) {
      while (baseWidth + increment < state.width) {
        columnCount += 1;
        increment += 300;
      }
    }
    return <MasonryLayout columns={columnCount}>{children(columnCount)}</MasonryLayout>;
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.data.length, nextProps.data.length) &&
      isEqualObjects(prevProps.state.tokenGQL, nextProps.state.tokenGQL) &&
      isEqualObjects(prevProps.state.isLoggedIn, nextProps.state.isLoggedIn) &&
      isEqualObjects(prevProps.state.imagesData, nextProps.state.imagesData) &&
      isEqualObjects(prevProps.state.perPage, nextProps.state.perPage) &&
      isEqualObjects(prevProps.state.width, nextProps.state.width)
    ); // when the component receives updated data from state such as load more, or clicked to login to access graphql
    // it needs to get re-render to get new data.
  }
);
interface mergedData {
  append: string;
  nonAppend: string;
  noData: string;
}

interface ActionProps {
  mergedData: mergedData;
}

const Action = {
  mergedData: {
    append: 'append',
    noData: 'noData',
  },
} as ActionProps;

interface HomeProps {
  state: IState;
  stateStargazers: IStateStargazers;
  dispatch: any;
  dispatchStargazers: any;
  routerProps: RouteComponentProps<{}, {}, {}>;
}

const Home = React.memo<HomeProps>(
  ({ state, dispatch, dispatchStargazers, stateStargazers, routerProps }) => {
    const { query, mutation } = useApolloFactory();
    const { seenData, seenDataLoading, seenDataError } = query.getSeen;
    const { userData, userDataLoading, userDataError } = query.getUserData;
    const { userStarred } = query.getUserInfoStarred;
    // useState is used when the HTML depends on it directly to render something
    const [shouldRenderSkeleton, setRenderSkeleton] = useState(false);
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
    const _isMounted = useRef(true);

    const isDataExists = (data: Nullable<IDataOne>) => {
      if (data === undefined || data?.dataOne === undefined) {
        return [[], []];
      }
      const oldID: any[] = [];
      const newID: any[] = [];
      state.mergedData.map((obj) => {
        return oldID.push(obj.id);
      });
      data.dataOne.map((obj: MergedDataProps) => {
        return newID.push(obj.id);
      });
      return [oldID, newID];
    };
    const actionResolvedPromise = (action: string, data?: IDataOne, error?: string) => {
      if (data && action === 'append') {
        if (state.filterBySeen) {
          const alreadySeenCards =
            seenData.getSeen?.seenCards.reduce((acc: any[], obj: { id: number }) => {
              acc.push(obj.id);
              return acc;
            }, []) || [];
          const temp = data.dataOne
            .filter((obj) =>
              filterActionResolvedPromiseData(
                obj,
                !alreadySeenCards.includes(obj.id),
                userData?.getUserData?.languagePreference?.find((xx: any) => xx.language === obj.language && xx.checked)
              )
            )
            .filter((e: any) => !!e)
            .map((obj) => {
              obj['isQueue'] = false;
              return obj;
            });
          const tempImages = data.renderImages.filter((obj) => !alreadySeenCards.includes(obj.id));
          if (tempImages.length === 0) {
            dispatchImagesData('no data', dispatch);
          } else {
            dispatchImagesData(tempImages, dispatch);
          }
          dispatchAppendMergedData(temp, dispatch);
          if (temp.length === 0) {
            dispatchPage(dispatch);
          }
        } else {
          if (data.renderImages.length === 0) {
            dispatchImagesData('no data', dispatch);
          } else {
            dispatchImagesData(data.renderImages, dispatch);
          }
          data.dataOne.map((obj) => {
            obj['isQueue'] = false;
            return obj;
          });
          dispatchAppendMergedData(data.dataOne, dispatch);
        }
      }
      if (action === 'noData') {
        isFetchFinish.current = true;
        setLoading(false);
        setNotification(`Sorry, no more data found`);
      }
      if (data && data.error_404) {
        setNotification(`Sorry, no data found`);
      } else if (data && data.error_403) {
        setNotification('Sorry, API rate limit exceeded.');
      } else if (error) {
        setNotification(error);
      }
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
          getSearchTopics(clickedGQLTopic.queryTopic, userDataRef.current!)
            .then((res: any) => {
              const [oldID, newID] = isDataExists(res);
              // compare new with old data, if they differ, that means it still has data to fetch
              if (newID.length > 0 && _isMounted.current && !(_.uniq([...oldID, ...newID]).length === oldID.length)) {
                setLoading(false);
                actionResolvedPromise(Action.mergedData.append, res);
              } else if (res !== undefined && (res.error_404 || res.error_403)) {
                setLoading(false);
                actionResolvedPromise('', res);
              } else {
                actionResolvedPromise(Action.mergedData.noData, res);
              }
            })
            .catch((error) => {
              setLoading(false);
              actionResolvedPromise('', undefined, error);
            });
        } else {
          let userNameTransformed: string[];
          if (!Array.isArray(state.username)) {
            userNameTransformed = [state.username];
          } else {
            userNameTransformed = state.username;
          }
          let promises: Promise<any>[] = [];
          userNameTransformed.forEach((name) => {
            promises.push(
              getUser(
                name,
                state.perPage,
                state.page,
                userData && userData.getUserData ? userData.getUserData.token : ''
              )
                .then((data) => {
                  const [oldID, newID] = isDataExists(data);
                  // compare new with old data, if they differ, that means it still has data to fetch
                  if (
                    newID.length > 0 &&
                    _isMounted.current &&
                    !(_.uniq([...oldID, ...newID]).length === oldID.length)
                  ) {
                    setLoading(false);
                    actionResolvedPromise(Action.mergedData.append, data);
                  } else if (data !== undefined && (data.error_403 || data.error_404)) {
                    getOrg(
                      name,
                      state.perPage,
                      state.page,
                      userData && userData.getUserData ? userData.getUserData.token : ''
                    )
                      .then((data) => {
                        const [oldID, newID] = isDataExists(data);
                        // compare new with old data, if they differ, that means it still has data to fetch
                        if (
                          newID.length > 0 &&
                          _isMounted.current &&
                          !(_.uniq([...oldID, ...newID]).length === oldID.length)
                        ) {
                          setLoading(false);
                          actionResolvedPromise(Action.mergedData.append, data);
                        } else if (data !== undefined && (data.error_404 || data.error_403)) {
                          setLoading(false);
                          actionResolvedPromise('', data);
                        } else {
                          actionResolvedPromise(Action.mergedData.noData, data);
                        }
                      })
                      .catch(() => {
                        setLoading(false);
                        actionResolvedPromise('', data);
                      });
                  } else {
                    setLoading(false);
                    actionResolvedPromise(Action.mergedData.noData, data);
                  }
                })
                .catch((error) => {
                  setLoading(false);
                  actionResolvedPromise('', undefined, error);
                })
            );
          });
          Promise.all(promises).then(() => {});
        }
      }
    };
    const fetchUser = () => {
      setLoading(true);
      isFetchFinish.current = false;
      setNotification('');
      let userNameTransformed: string[];
      if (!Array.isArray(state.username)) {
        userNameTransformed = [state.username];
      } else {
        userNameTransformed = state.username;
      }
      let promises: Promise<any>[] = [];
      let paginationInfo = 0;
      userNameTransformed.forEach((name) => {
        promises.push(
          getUser(name, state.perPage, 1, userData && userData.getUserData ? userData.getUserData.token : '')
            .then((data) => {
              if (_isMounted && data?.dataOne?.length > 0) {
                setLoading(false);
                paginationInfo += data.paginationInfoData;
                dispatchLastPage(paginationInfo, dispatch); // for displaying the last page from the pagination
                actionResolvedPromise(Action.mergedData.append, data);
                setTimeout(() => {
                  // setTimeout is not sync function so it will execute setRenderSkeleton(true);
                  // first before setRenderSkeleton(false); so set 1.5 second for setRenderSkeleton(true) before
                  // changing state to false
                  setRenderSkeleton(false);
                }, 1000);
                setRenderSkeleton(true);
              } else if (data?.error_403) {
                setNotification('Sorry, API rate limit exceeded.');
                setLoading(false);
              } else if (data?.dataOne?.length === 0 || data?.error_404) {
                getOrg(name, state.perPage, 1, data && data.getUserData ? data.getUserData.token : '')
                  .then((data) => {
                    if (_isMounted && data.dataOne?.length > 0) {
                      setLoading(false);
                      paginationInfo += data.paginationInfoData;
                      dispatchLastPage(paginationInfo, dispatch); // for displaying the last page from the pagination
                      actionResolvedPromise(Action.mergedData.append, data);
                      setTimeout(() => {
                        // setTimeout is not sync function so it will execute setRenderSkeleton(true);
                        // first before setRenderSkeleton(false); so set 1.5 second for setRenderSkeleton(true) before
                        // changing state to false
                        setRenderSkeleton(false);
                      }, 1000);
                      setRenderSkeleton(true);
                    } else if (data.dataOne?.length === 0 || data.error_403 || data.error_404) {
                      setLoading(false);
                      actionResolvedPromise('', data);
                    }
                  })
                  .catch(() => {
                    setLoading(false);
                    actionResolvedPromise('', data);
                  });
              }
            })
            .catch((err) => {
              setLoading(false);
              actionResolvedPromise('', undefined, err);
            })
        );
      });
      Promise.all(promises).then(() => {});
    };
    const mergedDataRef = useRef<any[]>([]);
    const isLoadingRef = useRef<boolean>(false);
    const imagesDataRef = useRef<any[]>([]);
    const filterBySeenRef = useRef<boolean>(state.filterBySeen);
    const notificationRef = useRef<string>('');
    useEffect(() => {
      mergedDataRef.current = state.mergedData;
    });
    useEffect(() => {
      isLoadingRef.current = isLoading;
    });
    useEffect(() => {
      notificationRef.current = notification;
    });
    useEffect(() => {
      imagesDataRef.current = state.imagesData;
    });
    useEffect(() => {
      filterBySeenRef.current = state.filterBySeen;
    });
    const handleBottomHit = useCallback(() => {
      if (
        !isFetchFinish.current &&
        mergedDataRef.current.length > 0 &&
        !isLoadingRef.current &&
        window.location.pathname === '/' &&
        notificationRef.current === '' &&
        filterBySeenRef.current
      ) {
        dispatchPage(dispatch);
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
              imagesData: imagesDataRef.current.filter((xx) => xx.id === obj.id).map((obj) => [...obj.value])[0] || [],
              name: obj.name,
              is_queried: false,
            }
          );
          acc.push(temp);
          return acc;
        }, [] as SeenProps[]);
        if (result.length > 0 && imagesDataRef.current.length > 0 && state.isLoggedIn) {
          mutation
            .seenAdded({
              variables: {
                seenCards: result,
              },
            })
            .then(() => {});
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      isFetchFinish.current,
      mergedDataRef.current,
      isLoadingRef.current,
      imagesDataRef.current,
      notificationRef.current,
      window.location.pathname,
      filterBySeenRef.current,
      state.isLoggedIn,
    ]);

    useBottomHit(
      windowScreenRef,
      handleBottomHit,
      isLoading || shouldRenderSkeleton || isFetchFinish.current // include isFetchFinish to indicate not to listen anymore
    );

    function handleResize() {
      dispatch({
        type: 'SET_WIDTH',
        payload: {
          width: window.innerWidth,
        },
      });
    }

    const whichToUse = useCallback(() => {
      // useCallback will avoid unnecessary child re-renders due to something changing in the parent that
      // is not part of the dependencies for the callback.
      if (state.filteredMergedData.length > 0) {
        return state.filteredMergedData;
      }
      return state.mergedData; // return this if filteredTopics.length === 0
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.mergedData, state.filteredMergedData]);

    useResizeHandler(windowScreenRef, handleResize);
    useDeepCompareEffect(() => {
      // when the username changes, that means the user submit form at SearchBar.js + dispatchMergedData([]) there
      if (state.username.length > 0 && state.mergedData.length === 0) {
        // we want to preserve state.username so that when the user navigate away from Home, then go back again, and do the scroll again,
        // we still want to retain the memory of username so that's why we use reducer of state.username.
        // However, as the component unmount, state.username is not "", thus causing fetchUser to fire in useEffect
        // to prevent that, use state.mergedData.length === 0 so that when it's indeed 0, that means no data anything yet so need to fetch first time
        // otherwise, don't re-fetch. in this way, state.username and state.mergedData are still preserved
        fetchUser();
      }
      // when you type google in SearchBar.js, then perPage=10, you can fetch. then when you change perPage=40 and type google again
      // it cannot fetch because if the dependency array of fetchUser() is only [state.username] so state.username not change so not execute
      // so you need another dependency of state.perPage
      // you also need state.mergedData because on submit in SearchBar.js, you specify dispatchMergedData([])
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.username, state.perPage, state.mergedData]);
    useEffect(() => {
      if (state.username.length > 0 && window.location.pathname === '/') {
        fetchUserMore();
      } else if (
        state.username.length === 0 &&
        clickedGQLTopic.queryTopic !== '' &&
        window.location.pathname === '/' &&
        state.filterBySeen
      ) {
        fetchUserMore();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.page]);
    useEffect(() => {
      if (
        !userDataLoading &&
        !userDataError &&
        userData.getUserData?.tokenRSS &&
        userData.getUserData?.tokenRSS !== '' &&
        state.tokenRSS === ''
      ) {
        dispatch({
          type: 'TOKEN_RSS_ADDED',
          payload: {
            tokenRSS: userData.getUserData.tokenRSS,
          },
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userDataLoading, userDataError]);
    useEffect(() => {
      if (!seenDataLoading && !seenDataError && seenData && seenData.getSeen !== null) {
        if (!state.filterBySeen) {
          const images = state.undisplayMergedData.reduce((acc, obj: any) => {
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
          }, [] as any[]);
          dispatchImagesData(images, dispatch);
          dispatchMergedData(state.undisplayMergedData, dispatch);
        } else {
          const ids = state.undisplayMergedData.reduce((acc, obj) => {
            acc.push(obj.id);
            return acc;
          }, [] as number[]);
          const temp = state.mergedData.filter((obj) => !ids.includes(obj.id));
          const images = state.imagesData.filter((obj) => !ids.includes(obj.id));
          dispatch({
            type: 'IMAGES_DATA_REPLACE',
            payload: {
              imagesData: images,
            },
          });
          dispatchMergedData(temp, dispatch);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.filterBySeen]);
    useEffect(() => {
      if (!seenDataLoading && !seenDataError && seenData.getSeen !== null && seenData.getSeen.seenCards.length > 0) {
        dispatch({
          type: 'UNDISPLAY_MERGED_DATA',
          payload: {
            undisplayMergedData: seenData.getSeen.seenCards,
          },
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seenDataLoading, seenDataError, seenData]);
    useEffect(
      () => {
        _isMounted.current = true;
        if (_isMounted.current && state.mergedData.length > 0 && state.shouldFetchImages) {
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
                  },
                }
              )
            );
            return acc;
          }, [] as any[]);
          const token = userData && userData.getUserData ? userData.getUserData.token : '';
          getRepoImages(data, clickedGQLTopic.variables.queryTopic, state.page, token)
            .then((repoImage) => {
              if (repoImage.renderImages.length > 0) {
                dispatchShouldFetchImagesData(false, dispatch);
                dispatchImagesData(repoImage.renderImages, dispatch);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [state.mergedData, state.shouldFetchImages]
    );
    const userDataRef = useRef();
    useEffect(() => {
      userDataRef.current = userData?.getUserData?.token || '';
    });
    const onClickTopic = useCallback(
      async ({ variables }) => {
        if (state.tokenGQL !== '' && userDataRef.current && state.filterBySeen) {
          setLoading(true);
          dispatch({
            type: 'REMOVE_ALL',
          });
          dispatchStargazers({
            type: 'REMOVE_ALL',
          });
          dispatchUsername('', dispatch);
          isFetchFinish.current = false;
          setNotification('');
          setGQLTopic({
            variables,
          });
          let paginationInfo = 0;
          return await getSearchTopics(variables.queryTopic, userDataRef.current!)
            .then((result) => {
              if (_isMounted && result?.dataOne?.length > 0) {
                setLoading(false);
                paginationInfo += result.paginationInfoData;
                dispatchLastPage(paginationInfo, dispatch); // for displaying the last page from the pagination
                actionResolvedPromise(Action.mergedData.append, result);
                setTimeout(() => {
                  // setTimeout is not sync function so it will execute setRenderSkeleton(true);
                  // first before setRenderSkeleton(false); so set 1.5 second for setRenderSkeleton(true) before
                  // changing state to false
                  setRenderSkeleton(false);
                }, 1000);
                setRenderSkeleton(true);
              } else if (result?.error_403) {
                setNotification('Sorry, API rate limit exceeded.');
                setLoading(false);
              } else if (result?.dataOne?.length === 0 || result?.error_404) {
                setLoading(false);
                actionResolvedPromise('', result);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [state.tokenGQL, userDataRef.current, state.filterBySeen] // if not specified, state.tokenGQL !== '' will always true when you click it again, even though state.tokenGQL already updated
    );
    const { getRootProps } = useEventHandlerComposer({ onClickCb: onClickTopic });

    const dispatchStargazersUserMemoize = useCallback(() => {
      return dispatchStargazers;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatchStargazers]);

    const dispatchMemoize = useCallback(() => {
      return dispatch;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    const stateMemoize = useCallback(() => {
      return state;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    const stateBottomNavigationBarMemoize = useCallback(() => {
      return state;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.page, state.lastPage, state.tokenRSS, state.isLoggedIn]);

    const dataMongoMemoize = useCallback(() => {
      return userStarred;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userStarred?.getUserInfoStarred?.starred]);

    // TODO: change the styling like: https://gatsby.pizza/ or maybe styling like nested menu (NOT SURE YET)

    // TODO: put the color of each card to change as the user scroll to the bottom to see it: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
    // and put delay at each Card so that as if the animation is at random

    // TODO: show related topics that you get from queries.ts

    // TODO: sortable cards based on topics, and when clicked to the topic section
    // it should show effect: https://codyhouse.co/ds/components/app/looping-tabs

    //TODO: handle the case where the user revoke his token

    //TODO: add "Trending" section to show the hottest git based on time-series stars

    return (
      <React.Fragment>
        <Helmet>
          <title>Github Fetcher Dashboard</title>
          <meta
            name="description"
            content="Improving Github search and discover experience with an enhanced user-interface and functionalities"
          />
        </Helmet>
        {/*we want ScrollPositionManager to be unmounted when router changes because the way it works is to save scroll position
       when unmounted*/}
        <ScrollPositionManager scrollKey="home" />
        <div
          ref={windowScreenRef}
          className={clsx('', {
            header: state.mergedData?.length > 0,
          })}
          style={{ marginLeft: `${state.drawerWidth + 5}px`, zIndex: state.visible ? -1 : 0 }}
        >
          {
            // we want to render Card first and ImagesCard later because it requires more bandwith
            // so no need to use state.imagesData condition on top of state.mergedData?.length > 0 && !shouldRenderSkeleton
            // below, otherwise it's going to slow to wait for ImagesCard as the Card won't get re-render instantly consequently
          }
          <If condition={!state.filterBySeen && seenData?.getSeen}>
            <Then>
              <div style={{ textAlign: 'center' }}>
                <h3>
                  Your {seenData?.getSeen?.seenCards?.length > 0 ? seenData.getSeen.seenCards.length : ''} Card History:
                </h3>
              </div>
            </Then>
          </If>
          <If condition={state.mergedData?.length > 0 && !shouldRenderSkeleton}>
            <Then>
              <MasonryLayoutMemo data={whichToUse()} state={state}>
                {(columnCount: number) => {
                  return Object.keys(whichToUse()).map((key) => (
                    <Card
                      key={key}
                      columnCount={columnCount}
                      routerProps={routerProps}
                      dataMongoMemoize={dataMongoMemoize()}
                      getRootProps={getRootProps}
                      index={whichToUse()[key].id}
                      githubData={whichToUse()[key]}
                      state={stateMemoize()}
                      dispatchStargazersUser={dispatchStargazersUserMemoize()}
                      dispatch={dispatchMemoize()}
                    />
                  ));
                }}
              </MasonryLayoutMemo>
            </Then>
          </If>
          <If condition={shouldRenderSkeleton}>
            <Then>
              <MasonryLayoutMemo data={whichToUse()} state={state}>
                {() => {
                  return Object.keys(state.mergedData).map((key) => <CardSkeleton key={key} />);
                }}
              </MasonryLayoutMemo>
            </Then>
          </If>

          <If condition={isLoading}>
            <Then>
              <div className="loader-xx">Loading...</div>
            </Then>
          </If>

          <If condition={notification}>
            <Then>
              <div style={{ textAlign: 'center' }}>
                <h1>{notification}</h1>
              </div>
            </Then>
          </If>
        </div>
        <If condition={state.width > 1100}>
          <Then>
            <BottomNavigationBar
              state={stateBottomNavigationBarMemoize()}
              dispatch={dispatchMemoize()}
              dispatchStargazersUser={dispatchStargazersUserMemoize()}
            />
          </Then>
        </If>
      </React.Fragment>
    );
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.path, nextProps.path) &&
      isEqualObjects(prevProps.state, nextProps.state) &&
      isEqualObjects(prevProps.stateStargazers, nextProps.stateStargazers)
    );
  }
);
export default Home;
