import React, { useCallback, useEffect, useRef, useState } from 'react';
import CardSkeleton from './HomeBody/CardSkeleton';
import { getOrg, getRepoImages, getSearchTopics, getUser } from './services';
import MasonryLayout from './Layout/MasonryLayout';
import _ from 'lodash';
import { useEventHandlerComposer, useResizeHandler } from './hooks/hooks';
import { IAction, IDataOne, IState, IStateShared, IStateStargazers } from './typing/interface';
import { MergedDataProps, Nullable, SeenProps } from './typing/type';
import Card from './HomeBody/Card';
import ScrollPositionManager from './util/scrollPositionSaver';
import { Then } from './util/react-if/Then';
import { If } from './util/react-if/If';
import clsx from 'clsx';
import useBottomHit from './hooks/useBottomHit';
import { fastFilter, isEqualObjects } from './util';
import useDeepCompareEffect from './hooks/useDeepCompareEffect';
import BottomNavigationBar from './HomeBody/BottomNavigationBar';
import { Helmet } from 'react-helmet';
import { useApolloFactory } from './hooks/useApolloFactory';
import { noop } from './util/util';
import eye from './new_16-2.gif';
import { ActionStargazers } from './store/Staargazers/reducer';
import { ActionResolvedPromise } from './Global';
import { Action } from './store/reducer';
import { ActionShared } from './store/Shared/reducer';

// only re-render Card component when mergedData and idx changes
// Memo: given the same/always same props, always render the same output
// A common situation that makes a component render with the same props is being forced to render by a parent component.
interface MasonryLayoutMemo {
  children: any;
  data: IState['mergedData'];
  state: IState;
  stateShared: IStateShared;
}

// const screenWidth = (width) => {
//   if (1)
// }
// if you only include isEqualObjects(prevProps.mergedData.length, nextProps.mergedData.length) as
// propsAreEqual condition checker, the child of Masonry's Card won't get updated state like new tokenGQL when the user logged in using
// LoginGQL component from StargazersCard. We want to memoize masonry since it involves expensive DOM manipulation
const MasonryLayoutMemo = React.memo<MasonryLayoutMemo>(
  ({ children, data, state, stateShared }) => {
    let columnCount = stateShared.width < 760 ? 1 : 2;
    let increment = 300;
    const baseWidth = 760;
    if (stateShared.width > 760) {
      while (baseWidth + increment < stateShared.width) {
        columnCount += 1;
        increment += 300;
      }
    }
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

interface Output {
  isFetchFinish: boolean;
}

interface HomeProps {
  state: IState;
  stateStargazers: IStateStargazers;
  stateShared: IStateShared;
  dispatchStargazers: React.Dispatch<IAction<ActionStargazers>>;
  dispatch: React.Dispatch<IAction<Action>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
  actionResolvedPromise: (
    action: ActionResolvedPromise,
    setLoading: any,
    setNotification: any,
    isFetchFinish: boolean,
    displayName: string,
    data?: Nullable<IDataOne | any>,
    error?: string
  ) => Output;
}

const Home = React.memo<HomeProps>(
  ({ state, stateShared, dispatch, dispatchStargazers, dispatchShared, stateStargazers, actionResolvedPromise }) => {
    const displayName: string | undefined = (Home as React.ComponentType<any>).displayName;
    const { seenData, seenDataLoading, seenDataError } = useApolloFactory(displayName!).query.getSeen();
    const { userData, userDataLoading, userDataError } = useApolloFactory(displayName!).query.getUserData();
    const seenAdded = useApolloFactory(displayName!).mutation.seenAdded;
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

      return newID.length > 0 && _isMounted.current && !(_.uniq([...oldID, ...newID]).length === oldID.length);
    };
    const isFunction = (value: () => void) =>
      value && (Object.prototype.toString.call(value) === '[object Function]' || 'function' === typeof value || true)
        ? value()
        : new Error('Not valid function!');

    const actionController = (res: IDataOne, callback?: Promise<any> | any) => {
      // compare new with old data, if they differ, that means it still has data to fetch
      const promiseOrNot = () => {
        callback() instanceof Promise && res !== undefined && (res.error_404 || res.error_403)
          ? callback()
          : isFunction(callback);
      };
      if (isDataExists(res)) {
        actionResolvedPromise(
          ActionResolvedPromise.append,
          setLoading,
          setNotification,
          isFetchFinish.current,
          displayName!,
          res
        );
      } else if (res !== undefined && (res.error_404 || res.error_403)) {
        callback
          ? promiseOrNot()
          : actionResolvedPromise(
              ActionResolvedPromise.error,
              setLoading,
              setNotification,
              isFetchFinish.current,
              displayName!,
              res
            );
      } else {
        isFetchFinish.current = actionResolvedPromise(
          ActionResolvedPromise.noData,
          setLoading,
          setNotification,
          isFetchFinish.current,
          displayName!,
          res
        ).isFetchFinish;
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
            .then((res: IDataOne) => {
              actionController(res);
            })
            .catch((error) => {
              actionResolvedPromise(
                ActionResolvedPromise.error,
                setLoading,
                setNotification,
                isFetchFinish.current,
                error
              );
            });
        } else {
          let userNameTransformed: string[];
          if (!Array.isArray(stateShared.username)) {
            userNameTransformed = [stateShared.username];
          } else {
            userNameTransformed = stateShared.username;
          }
          const promises: Promise<void>[] = [];
          userNameTransformed.forEach((name) => {
            promises.push(
              getUser(
                name,
                stateShared.perPage,
                state.page,
                userData && userData.getUserData ? userData.getUserData.token : ''
              )
                .then((data: IDataOne) => {
                  const callback = () =>
                    getOrg(
                      name,
                      stateShared.perPage,
                      1,
                      userData && userData.getUserData ? userData.getUserData.token : ''
                    )
                      .then((data: IDataOne) => {
                        actionController(data);
                      })
                      .catch((err) => {
                        actionResolvedPromise(
                          ActionResolvedPromise.error,
                          setLoading,
                          setNotification,
                          isFetchFinish.current,
                          displayName!,
                          err
                        );
                      });
                  actionController(data, callback);
                })
                .catch((error) => {
                  actionResolvedPromise(
                    ActionResolvedPromise.error,
                    setLoading,
                    setNotification,
                    isFetchFinish.current,
                    displayName!,
                    error
                  );
                })
            );
          });
          Promise.all(promises).then(noop);
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
          getUser(name, stateShared.perPage, 1, userData ? userData.getUserData.token : '')
            .then((data: IDataOne) => {
              const callback = () =>
                getOrg(name, stateShared.perPage, 1, userData && userData.getUserData ? userData.getUserData.token : '')
                  .then((data: IDataOne) => {
                    paginationInfo += data.paginationInfoData;
                    dispatch({
                      type: 'LAST_PAGE',
                      payload: {
                        lastPage: paginationInfo,
                      },
                    });
                    setTimeout(() => {
                      // setTimeout is not sync function so it will execute setRenderSkeleton(true);
                      // first before setRenderSkeleton(false); so set 1.5 second for setRenderSkeleton(true) before
                      // changing state to false
                      setRenderSkeleton(false);
                    }, 1000);
                    setRenderSkeleton(true);
                    actionController(data);
                  })
                  .catch((err) => {
                    actionResolvedPromise(
                      ActionResolvedPromise.error,
                      setLoading,
                      setNotification,
                      isFetchFinish.current,
                      displayName!,
                      err
                    );
                  });
              paginationInfo += data.paginationInfoData;
              dispatch({
                type: 'LAST_PAGE',
                payload: {
                  lastPage: paginationInfo,
                },
              });
              setTimeout(() => {
                // setTimeout is not sync function so it will execute setRenderSkeleton(true);
                // first before setRenderSkeleton(false); so set 1.5 second for setRenderSkeleton(true) before
                // changing state to false
                setRenderSkeleton(false);
              }, 1000);
              setRenderSkeleton(true);
              actionController(data, callback);
            })
            .catch((err) => {
              actionResolvedPromise(
                ActionResolvedPromise.error,
                setLoading,
                setNotification,
                isFetchFinish.current,
                displayName!,
                err
              );
            })
        );
      });
      Promise.all(promises).then(noop);
    };
    const mergedDataRef = useRef<MergedDataProps[]>([]);
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
              imagesData: imagesDataRef.current.filter((xx) => xx.id === obj.id).map((obj) => [...obj.value])[0] || [],
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
    }, [
      isFetchFinish.current,
      mergedDataRef.current,
      isLoadingRef.current,
      imagesDataRef.current,
      notificationRef.current,
      window.location.pathname,
      filterBySeenRef.current,
      stateShared.isLoggedIn,
    ]);

    useBottomHit(
      windowScreenRef,
      handleBottomHit,
      isLoading || shouldRenderSkeleton || isFetchFinish.current // include isFetchFinish to indicate not to listen anymore
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
      // when the username changes, that means the user submit form at SearchBar.js + dispatchMergedData([]) there
      if (stateShared.username.length > 0 && state.mergedData.length === 0) {
        // we want to preserve stateShared.username so that when the user navigate away from Home, then go back again, and do the scroll again,
        // we still want to retain the memory of username so that's why we use reducer of stateShared.username.
        // However, as the component unmount, stateShared.username is not "", thus causing fetchUser to fire in useEffect
        // to prevent that, use state.mergedData.length === 0 so that when it's indeed 0, that means no data anything yet so need to fetch first time
        // otherwise, don't re-fetch. in this way, stateShared.username and state.mergedData are still preserved
        fetchUser();
      }
      // when you type google in SearchBar.js, then perPage=10, you can fetch. then when you change perPage=40 and type google again
      // it cannot fetch because if the dependency array of fetchUser() is only [stateShared.username] so stateShared.username not change so not execute
      // so you need another dependency of stateShared.perPage
      // you also need state.mergedData because on submit in SearchBar.js, you specify dispatchMergedData([])
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateShared.username, stateShared.perPage, state.mergedData]);
    useEffect(() => {
      if (stateShared.username.length > 0) {
        fetchUserMore();
      } else if (stateShared.username.length === 0 && clickedGQLTopic.queryTopic !== '' && state.filterBySeen) {
        fetchUserMore();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.page]);
    useEffect(() => {
      if (
        !userDataLoading &&
        !userDataError &&
        userData?.getUserData?.tokenRSS &&
        userData?.getUserData?.tokenRSS !== '' &&
        stateShared.tokenRSS === ''
      ) {
        dispatchShared({
          type: 'TOKEN_RSS_ADDED',
          payload: {
            tokenRSS: userData?.getUserData?.tokenRSS,
          },
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userDataLoading, userDataError]);

    useEffect(() => {
      if (!seenDataLoading && !seenDataError && seenData && seenData.getSeen !== null) {
        if (!state.filterBySeen) {
          const images = state.undisplayMergedData.reduce((acc: any[], obj: SeenProps) => {
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
              data: state.undisplayMergedData,
            },
          });
        } else {
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
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.filterBySeen]);
    useEffect(() => {
      if (!seenDataLoading && !seenDataError && seenData?.getSeen?.seenCards && seenData.getSeen.seenCards.length > 0) {
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
          getRepoImages(
            data,
            Array.isArray(stateShared.username) ? stateShared.username[0] : stateShared.username,
            state.page,
            token
          )
            .then((repoImage) => {
              if (repoImage.renderImages.length > 0) {
                dispatch({
                  type: 'SHOULD_IMAGES_DATA_ADDED',
                  payload: {
                    shouldFetchImages: false,
                  },
                });
                dispatch({
                  type: 'IMAGES_DATA_ADDED',
                  payload: {
                    images: repoImage.renderImages,
                  },
                });
              }
            })
            .catch((err) => {
              actionResolvedPromise(
                ActionResolvedPromise.error,
                setLoading,
                setNotification,
                isFetchFinish.current,
                displayName!,
                err
              );
            });
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [state.mergedData, state.shouldFetchImages]
    );
    const userDataRef = useRef<string>();
    useEffect(() => {
      userDataRef.current = userData?.getUserData?.token || '';
    });
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
          return await getSearchTopics(variables.queryTopic, userDataRef.current!)
            .then((result: IDataOne) => {
              paginationInfo += result.paginationInfoData;
              dispatch({
                type: 'LAST_PAGE',
                payload: {
                  lastPage: paginationInfo,
                },
              });
              actionController(result);
              setTimeout(() => {
                setRenderSkeleton(false);
              }, 1000);
              setRenderSkeleton(true);
            })
            .catch((err) => {
              actionResolvedPromise(
                ActionResolvedPromise.error,
                setLoading,
                setNotification,
                isFetchFinish.current,
                displayName!,
                err
              );
            });
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [stateShared.tokenGQL, userDataRef.current, state.filterBySeen] // if not specified, stateShared.tokenGQL !== '' will always true when you click it again, even though stateShared.tokenGQL already updated
    );
    const { getRootProps } = useEventHandlerComposer({ onClickCb: onClickTopic });

    const stateMemoize = useCallback(() => {
      return state;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    const stateStargazersMemoize = useCallback(() => {
      return stateStargazers;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateStargazers]);

    const whichToUse = useCallback(() => {
      // useCallback will avoid unnecessary child re-renders due to something changing in the parent that
      // is not part of the dependencies for the callback.
      if (state.filteredMergedData.length > 0) {
        return state.filteredMergedData;
      }
      return state.mergedData; // return this if filteredTopics.length === 0
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.mergedData, state.filteredMergedData]);

    // TODO: change the styling like: https://gatsby.pizza/ or maybe styling like nested menu (NOT SURE YET)

    // TODO: put the color of each card to change as the user scroll to the bottom to see it: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
    // and put delay at each Card so that as if the animation is at random

    // TODO: show related topics that you get from queries.ts

    // TODO: sortable cards based on topics, and when clicked to the topic section
    // it should show effect: https://codyhouse.co/ds/components/app/looping-tabs

    //TODO: handle the case where the user revoke his token

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
          style={{ marginLeft: `${stateShared.drawerWidth + 5}px`, zIndex: state.visible ? -1 : 0 }}
        >
          {
            // we want to render Card first and ImagesCard later because it requires more bandwith
            // so no need to use state.imagesData condition on top of state.mergedData?.length > 0 && !shouldRenderSkeleton
            // below, otherwise it's going to slow to wait for ImagesCard as the Card won't get re-render instantly consequently
          }
          <If
            condition={!state.filterBySeen && seenData?.getSeen?.seenCards && seenData?.getSeen?.seenCards?.length > 0}
          >
            <Then>
              <div style={{ textAlign: 'center' }}>
                <h3>
                  Your{' '}
                  {seenData?.getSeen?.seenCards && seenData?.getSeen?.seenCards?.length > 0
                    ? seenData.getSeen.seenCards.length
                    : ''}{' '}
                  Card History:
                </h3>
              </div>
            </Then>
          </If>
          <If condition={state.mergedData?.length > 0 && !shouldRenderSkeleton}>
            <Then>
              <MasonryLayoutMemo data={whichToUse()} state={state} stateShared={stateShared}>
                {(columnCount: number) => {
                  return Object.keys(whichToUse()).map((key, idx) => (
                    <Card
                      key={idx}
                      columnCount={columnCount}
                      stateStargazersMemoize={stateStargazersMemoize()}
                      getRootProps={getRootProps}
                      index={whichToUse()[idx].id}
                      githubData={whichToUse()[idx]}
                      state={stateMemoize()}
                      dispatchStargazersUser={dispatchStargazers}
                      dispatch={dispatch}
                    />
                  ));
                }}
              </MasonryLayoutMemo>
            </Then>
          </If>
          <If condition={shouldRenderSkeleton}>
            <Then>
              <MasonryLayoutMemo data={whichToUse()} state={state} stateShared={stateShared}>
                {() => {
                  return Object.keys(state.mergedData).map((_, idx) => <CardSkeleton key={idx} />);
                }}
              </MasonryLayoutMemo>
            </Then>
          </If>

          <If condition={isLoading}>
            <Then>
              <div style={{ textAlign: 'center' }}>
                <img src={eye} style={{ width: '100px' }} />
                <div style={{ textAlign: 'center' }}>
                  <h3>Please wait while fetching your data</h3>
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
        <If condition={stateShared.width > 1100}>
          <Then>
            <BottomNavigationBar
              state={state}
              stateShared={stateShared}
              dispatch={dispatch}
              dispatchStargazersUser={dispatchStargazers}
              dispatchShared={dispatchShared}
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
      isEqualObjects(prevProps.stateShared, nextProps.stateShared) &&
      isEqualObjects(prevProps.stateStargazers, nextProps.stateStargazers)
    );
  }
);
Home.displayName = 'Home';
export default Home;
