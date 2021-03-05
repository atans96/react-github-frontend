import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getRepoImages } from './services';
import MasonryLayout from './Layout/MasonryLayout';
import {
  dispatchAppendMergedDataDiscover,
  dispatchImagesDataDiscover,
  dispatchLastPageDiscover,
  dispatchPageDiscover,
} from './store/dispatcher';
import { useResizeHandler } from './hooks/hooks';
import { IState } from './typing/interface';
import { MergedDataProps, SeenProps } from './typing/type';
import ScrollPositionManager from './util/scrollPositionSaver';
import { Then } from './util/react-if/Then';
import { If } from './util/react-if/If';
import clsx from 'clsx';
import useBottomHit from './hooks/useBottomHit';
import { isEqualObjects } from './util';
import { RouteComponentProps } from 'react-router-dom';
import { filterActionResolvedPromiseData } from './util/util';
import CardDiscover from './HomeBody/CardDiscover';
import BottomNavigationBarDiscover from './HomeBody/BottomNavigationBarDiscover';
import useApolloFactory from './hooks/useApolloFactory';

interface MasonryLayoutMemo {
  children: any;
  data: IState['mergedData'];
  state: IState;
}

const MasonryLayoutMemo = React.memo<MasonryLayoutMemo>(
  ({ children, data, state }) => {
    let columnCount = 1;
    let increment = 300;
    let baseWidth = 760;
    if (state.width > 760) {
      while (baseWidth + increment <= state.width) {
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
      isEqualObjects(prevProps.state.imagesDataDiscover, nextProps.state.imagesDataDiscover) &&
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

interface DiscoverProps {
  state: IState;
  dispatch: any;
  dispatchStargazers: any;
  routerProps: RouteComponentProps<{}, {}, {}>;
}

const Discover = React.memo<DiscoverProps>(
  ({ state, dispatch, dispatchStargazers, routerProps }) => {
    const { mutation, query } = useApolloFactory();
    const { userData, userDataLoading, userDataError } = query.getUserData;
    const { seenData, seenDataLoading, seenDataError } = query.getSeen;
    const { starRankingData, starRankingDataLoading, starRankingDataError } = query.getStarRanking;
    const { userStarred, loadingUserStarred, errorUserStarred } = query.getUserInfoStarred;
    const { suggestedData, suggestedDataLoading, suggestedDataError } = query.getSuggestedRepo;
    // useState is used when the HTML depends on it directly to render something
    const [isLoading, setLoading] = useState(true);
    const paginationRef = useRef(state.perPage);
    const multiplier = useRef(state.perPage);
    const sortedDataRef = useRef([]);
    const [notification, setNotification] = useState('');
    const isFetchFinish = useRef(false); // indicator to stop fetching when we have no more data
    const windowScreenRef = useRef<HTMLDivElement>(null);
    const actionResolvedPromise = async (action: string, data?: any) => {
      if (data && action === 'append') {
        const alreadySeenCards =
          seenData.getSeen?.seenCards.reduce((acc: any[], obj: { id: number }) => {
            acc.push(obj.id);
            return acc;
          }, []) || [];
        let temp: any[];
        temp = data
          .filter((obj: any) =>
            filterActionResolvedPromiseData(
              obj,
              !alreadySeenCards.includes(obj.id),
              userData.getUserData.languagePreference.find((xx: any) => xx.language === obj.language && xx.checked)
            )
          )
          .filter((e: any) => !!e);
        if (temp.length > 0) {
          temp = temp.filter((obj: any) => userStarred.getUserInfoStarred.starred.includes(obj.id) === false);
        }
        let inputForImagesData = [];
        if (temp.length > 0) {
          dispatchAppendMergedDataDiscover(temp, dispatch);
          setLoading(false);
          const token = userData && userData.getUserData ? userData.getUserData.token : '';
          inputForImagesData = data.reduce((acc: any[], object: any) => {
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
          getRepoImages(inputForImagesData, 'wa1618i', state.pageDiscover + 1, token).then((repoImage) => {
            if (repoImage.renderImages.length > 0) {
              dispatchImagesDataDiscover(repoImage.renderImages, dispatch);
            } else {
              dispatchImagesDataDiscover('no data', dispatch);
            }
          });
          // do the prefetching images of 5 pages
          // let jar = 5;
          // while (jar < state.pageDiscover && state.pageDiscover > 1) {
          //   jar += 5;
          // }
          // if (
          //   (state.pageDiscover === 1 && alreadySeenCards.length === 0) ||
          //   (state.pageDiscover === 1 && alreadySeenCards.length > 0) ||
          //   Math.abs(state.pageDiscover - jar) <= 2
          // ) {
          //   let count = 0;
          //   while (count < 5) {
          //     if (state.pageDiscover === 1 && count === 0) {
          //       inputForImagesData = sortedDataRef.current.slice(0, state.perPage).reduce((acc: any[], object: any) => {
          //         acc.push(
          //           Object.assign(
          //             {},
          //             {
          //               id: object.id,
          //               value: {
          //                 full_name: object.full_name,
          //                 branch: object.default_branch,
          //               },
          //             }
          //           )
          //         );
          //         return acc;
          //       }, []);
          //     } else {
          //       multiplier.current += state.perPage;
          //       inputForImagesData = sortedDataRef.current
          //         .slice(multiplier.current - state.perPage, multiplier.current)
          //         .reduce((acc: any[], object: any) => {
          //           acc.push(
          //             Object.assign(
          //               {},
          //               {
          //                 id: object.id,
          //                 value: {
          //                   full_name: object.full_name,
          //                   branch: object.default_branch,
          //                 },
          //               }
          //             )
          //           );
          //           return acc;
          //         }, []);
          //     }
          //     const token = userData && userData.getUserData ? userData.getUserData.token : '';
          //     getRepoImages(inputForImagesData, 'wa1618i', state.pageDiscover + count, token).then((repoImage) => {
          //       if (repoImage.renderImages.length > 0) {
          //         dispatchImagesDataDiscover(repoImage.renderImages, dispatch);
          //       }
          //     });
          //     count += 1;
          //   }
          // }
        } else if (temp.length === 0) {
          dispatchPageDiscover(dispatch);
        }
      }
      if (action === 'noData') {
        isFetchFinish.current = true;
        setLoading(false);
        setNotification(`Sorry, no more data found`);
      }
    };
    const fetchUserMore = () => {
      if (!isFetchFinish.current && state.pageDiscover > 1) {
        setLoading(true); // spawn loading spinner at bottom page
        paginationRef.current += state.perPage;
        if (sortedDataRef.current.slice(paginationRef.current, paginationRef.current + state.perPage).length === 0) {
          actionResolvedPromise(Action.mergedData.noData).then(() => {});
        } else {
          actionResolvedPromise(
            Action.mergedData.append,
            sortedDataRef.current.slice(paginationRef.current, paginationRef.current + state.perPage)
          ).then(() => {});
        }
      }
    };
    const fetchUser = () => {
      isFetchFinish.current = false;
      dispatchLastPageDiscover(Math.ceil(suggestedData?.getSuggestedRepo?.repoInfo?.length / state.perPage), dispatch);
      const ids = suggestedData?.getSuggestedRepo?.repoInfo?.map((obj: any) => obj.id);
      const starRankingFiltered =
        starRankingData?.getStarRanking?.starRanking
          ?.filter((xx: any) => ids.includes(xx.id))
          .reduce((acc: any[], obj: any) => {
            const temp = Object.assign({}, { trends: obj.trends, id: obj.id });
            acc.push(temp);
            return acc;
          }, [])
          .sort((a: any, b: any) => b['trends']['daily'] - a['trends']['daily']) || [];
      //TODO: make 'daily' to be sortable by the user in the monitor
      const sortedIds = starRankingFiltered.map((obj: any) => obj.id);
      sortedDataRef.current = suggestedData?.getSuggestedRepo?.repoInfo
        ?.slice()
        .sort((a: any, b: any) => {
          return sortedIds.indexOf(a.id) - sortedIds.indexOf(b.id);
        })
        .map((obj: any) => {
          const copyObj = Object.assign({}, obj);
          copyObj.trends = starRankingFiltered.find((xx: any) => xx.id === obj.id)
            ? starRankingFiltered.find((xx: any) => xx.id === obj.id).trends.daily
            : 0;
          return copyObj;
        });
      if (sortedDataRef.current.slice(0, state.perPage).length === 0) {
        actionResolvedPromise(Action.mergedData.noData).then(() => {});
      } else {
        actionResolvedPromise(Action.mergedData.append, sortedDataRef.current.slice(0, state.perPage)).then(() => {});
      }
    };
    const mergedDataRef = useRef<any[]>([]);
    const imagesDataRef = useRef<any[]>([]);
    const isLoadingRef = useRef<boolean>(true);
    const notificationRef = useRef<string>('');
    useEffect(() => {
      mergedDataRef.current = state.mergedDataDiscover;
    });
    useEffect(() => {
      imagesDataRef.current = state.imagesDataDiscover;
    });
    useEffect(() => {
      isLoadingRef.current = isLoading;
    });
    useEffect(() => {
      notificationRef.current = notification;
    });
    const handleBottomHit = useCallback(() => {
      if (
        !isFetchFinish.current &&
        mergedDataRef.current.length > 0 &&
        !isLoadingRef.current &&
        window.location.pathname === '/discover' &&
        notificationRef.current === ''
      ) {
        dispatchPageDiscover(dispatch);
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
          //don't add to database yet when imagesData still loading.
          mutation
            .seenAdded({
              variables: {
                seenCards: result,
              },
            })
            .then(() => {});
        }
      }
    }, [
      isFetchFinish.current,
      mergedDataRef.current,
      isLoadingRef.current,
      imagesDataRef.current,
      notificationRef.current,
      window.location.pathname,
      state.isLoggedIn,
    ]);

    useBottomHit(
      windowScreenRef,
      handleBottomHit,
      isLoading || isFetchFinish.current // include isFetchFinish to indicate not to listen anymore
    );

    function handleResize() {
      dispatch({
        type: 'SET_WIDTH',
        payload: {
          width: window.innerWidth,
        },
      });
    }

    useResizeHandler(windowScreenRef, handleResize);
    useEffect(() => {
      // when the username changes, that means the user submit form at SearchBar.js + dispatchMergedDataDiscover([]) there
      if (
        !userDataLoading &&
        !userDataError &&
        !!userData?.getUserData &&
        !seenDataLoading &&
        !seenDataError &&
        !starRankingDataLoading &&
        !starRankingDataError &&
        !suggestedDataLoading &&
        !!suggestedData?.getSuggestedRepo &&
        !suggestedDataError &&
        !errorUserStarred &&
        !loadingUserStarred
      ) {
        fetchUser();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      userDataLoading,
      userDataError,
      userData,
      seenDataLoading,
      seenDataError,
      starRankingDataLoading,
      starRankingDataError,
      suggestedDataLoading,
      suggestedDataError,
      errorUserStarred,
      loadingUserStarred,
    ]);

    useEffect(() => {
      if (state.pageDiscover > 1 && notification === '') {
        fetchUserMore();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.pageDiscover]);

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
    }, [state.pageDiscover, state.lastPageDiscover, state.tokenRSS, state.isLoggedIn]);

    const dataMongoMemoize = useCallback(() => {
      return userStarred;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userStarred?.getUserInfoStarred?.starred]);

    return (
      <React.Fragment>
        {/*we want ScrollPositionManager to be unmounted when router changes because the way it works is to save scroll position
       when unmounted*/}
        <ScrollPositionManager scrollKey="discover" />
        <div
          ref={windowScreenRef}
          className={clsx('', {
            header: state.mergedDataDiscover?.length > 0,
          })}
          style={{ marginLeft: `${state.drawerWidth + 5}px`, zIndex: state.visible ? -1 : 0 }}
        >
          <If condition={notification === '' && state.mergedDataDiscover?.length > 0}>
            <Then>
              <MasonryLayoutMemo data={state.mergedDataDiscover} state={state}>
                {(columnCount: number) => {
                  return Object.keys(state.mergedDataDiscover).map((key) => (
                    <CardDiscover
                      key={key}
                      columnCount={columnCount}
                      routerProps={routerProps}
                      dataMongoMemoize={dataMongoMemoize()}
                      index={state.mergedDataDiscover[key].id}
                      githubData={state.mergedDataDiscover[key]}
                      state={stateMemoize()}
                      dispatchStargazersUser={dispatchStargazersUserMemoize()}
                      dispatch={dispatchMemoize()}
                    />
                  ));
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
            <BottomNavigationBarDiscover state={stateBottomNavigationBarMemoize()} />
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
export default Discover;
