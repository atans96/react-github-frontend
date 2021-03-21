import React, { useCallback, useEffect, useRef, useState } from 'react';
import MasonryLayout from './Layout/MasonryLayout';
import { dispatchLastPageDiscover, dispatchPageDiscover } from './store/dispatcher';
import { useResizeHandler } from './hooks/hooks';
import { IDataOne, IState, IStateStargazers, StaticState } from './typing/interface';
import { Action, MergedDataProps, Nullable, RenderImages, SeenProps } from './typing/type';
import ScrollPositionManager from './util/scrollPositionSaver';
import { Then } from './util/react-if/Then';
import { If } from './util/react-if/If';
import clsx from 'clsx';
import useBottomHit from './hooks/useBottomHit';
import { isEqualObjects } from './util';
import { RouteComponentProps } from 'react-router-dom';
import CardDiscover from './HomeBody/CardDiscover';
import BottomNavigationBarDiscover from './HomeBody/BottomNavigationBarDiscover';
import { sortedRepoInfoSelector, starRankingFilteredSelector, useSelector } from './selectors/stateSelector';
import { useApolloFactory } from './hooks/useApolloFactory';
import { noop } from './util/util';

interface MasonryLayoutMemo {
  children: any;
  data: IState['mergedData'];
  state: IState;
}

const MasonryLayoutMemo = React.memo<MasonryLayoutMemo>(
  ({ children, data, state }) => {
    let columnCount = 1;
    let increment = 300;
    const baseWidth = 760;
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
MasonryLayoutMemo.displayName = 'MasonryLayoutMemo';

interface Output {
  isFetchFinish: boolean;
}

interface DiscoverProps {
  state: IState;
  stateStargazers: IStateStargazers;
  dispatch: any;
  dispatchStargazers: any;
  routerProps: RouteComponentProps<Record<string, any>, Record<string, any>, Record<string, any>>;
  actionResolvedPromise: (
    action: Action,
    setLoading: any,
    setNotification: any,
    isFetchFinish: boolean,
    displayName: string,
    data?: Nullable<IDataOne | any>,
    error?: string
  ) => Output;
}

const Discover = React.memo<DiscoverProps>(
  ({ state, stateStargazers, dispatch, dispatchStargazers, routerProps, actionResolvedPromise }) => {
    const displayName: string | undefined = (Discover as React.ComponentType<any>).displayName;
    const seenAdded = useApolloFactory(displayName!).mutation.seenAdded;
    const { suggestedData, suggestedDataLoading, suggestedDataError } = useSelector(
      (state: StaticState) => state.SuggestedRepo
    );
    // useState is used when the HTML depends on it directly to render something
    const [isLoading, setLoading] = useState(false);
    const paginationRef = useRef(state.perPage);
    const sortedDataRef = useRef([]);
    const [notification, setNotification] = useState('');
    const isFetchFinish = useRef(false); // indicator to stop fetching when we have no more data
    const windowScreenRef = useRef<HTMLDivElement>(null);
    const fetchUserMore = () => {
      if (!isFetchFinish.current && state.pageDiscover > 1) {
        setLoading(true); // spawn loading spinner at bottom page
        paginationRef.current += state.perPage;
        if (sortedDataRef.current.slice(paginationRef.current, paginationRef.current + state.perPage).length === 0) {
          isFetchFinish.current = actionResolvedPromise(
            Action.noData,
            setLoading,
            setNotification,
            isFetchFinish.current,
            displayName!
          ).isFetchFinish;
        } else {
          actionResolvedPromise(
            Action.append,
            setLoading,
            setNotification,
            isFetchFinish.current,
            displayName!,
            sortedDataRef.current.slice(paginationRef.current, paginationRef.current + state.perPage)
          );
        }
      }
    };
    //TODO: make 'daily' to be sortable by the user in the monitor
    const starRankingFiltered: any[] = useSelector(starRankingFilteredSelector);
    sortedDataRef.current = useSelector(sortedRepoInfoSelector(starRankingFiltered));
    const fetchUser = () => {
      isFetchFinish.current = false;
      setLoading(true);
      dispatchLastPageDiscover(Math.ceil(suggestedData?.getSuggestedRepo?.repoInfo?.length / state.perPage), dispatch);
      if (sortedDataRef.current.slice(0, state.perPage).length === 0) {
        isFetchFinish.current = actionResolvedPromise(
          Action.noData,
          setLoading,
          setNotification,
          isFetchFinish.current,
          displayName!
        ).isFetchFinish;
      } else {
        actionResolvedPromise(
          Action.append,
          setLoading,
          setNotification,
          isFetchFinish.current,
          displayName!,
          sortedDataRef.current.slice(0, state.perPage)
        );
      }
    };

    const mergedDataRef = useRef<any[]>([]);
    const suggestedDataImages = useSelector((state: StaticState) => state.SuggestedRepoImages);
    const imagesDataDiscover:
      | { mapData: Map<number, RenderImages>; arrayData: [RenderImages] | any[] }
      | Map<any, any> = React.useMemo(() => {
      //return it to hashMap
      if (
        state.isLoggedIn &&
        !(suggestedDataImages.suggestedDataImagesError || suggestedDataImages.suggestedDataImagesLoading) &&
        suggestedDataImages.suggestedDataImages.getSuggestedRepoImages
      ) {
        return {
          mapData: new Map(
            suggestedDataImages.suggestedDataImages.getSuggestedRepoImages.renderImages.map((obj: RenderImages) => [
              obj.id,
              obj,
            ])
          ),
          arrayData: suggestedDataImages.suggestedDataImages.getSuggestedRepoImages.renderImages,
        };
      }
      return { mapData: new Map(), arrayData: [] };
    }, [state.isLoggedIn, suggestedDataImages]);

    const isLoadingRef = useRef<boolean>(true);
    const notificationRef = useRef<string>('');
    useEffect(() => {
      mergedDataRef.current = state.mergedDataDiscover;
    });
    useEffect(() => {
      isLoadingRef.current = isLoading;
    });
    useEffect(() => {
      notificationRef.current = notification;
    });
    const handleBottomHit = useCallback(
      () => {
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
                imagesData:
                  imagesDataDiscover.arrayData.filter((xx) => xx.id === obj.id).map((obj) => [...obj.value])[0] || [],
                name: obj.name,
                is_queried: false,
              }
            );
            acc.push(temp);
            return acc;
          }, [] as SeenProps[]);
          if (result.length > 0 && imagesDataDiscover.mapData.size > 0 && state.isLoggedIn) {
            //don't add to database yet when imagesData still loading.
            seenAdded({
              variables: {
                seenCards: result,
              },
            }).then(noop);
          }
        }
      }, // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        isFetchFinish.current,
        mergedDataRef.current,
        isLoadingRef.current,
        imagesDataDiscover,
        notificationRef.current,
        window.location.pathname,
        state.isLoggedIn,
      ]
    );

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
      if (!suggestedDataLoading && !!suggestedData?.getSuggestedRepo && !suggestedDataError) {
        fetchUser();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [suggestedDataLoading, suggestedDataError]);

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

    const stateStargazersMemoize = useCallback(() => {
      return stateStargazers;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateStargazers]);

    useEffect(() => {
      setLoading(state.isLoadingDiscover);
      setNotification(state.notificationDiscover);
    }, [state.isLoadingDiscover, state.notificationDiscover]);

    const whichToUse = useCallback(() => {
      // useCallback will avoid unnecessary child re-renders due to something changing in the parent that
      // is not part of the dependencies for the callback.
      if (state.filterMergedDataDiscover.length > 0) {
        isFetchFinish.current = true;
        return state.filterMergedDataDiscover;
      }
      isFetchFinish.current = false;
      return state.mergedDataDiscover; // return this if filteredTopics.length === 0
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.filterMergedDataDiscover, state.mergedDataDiscover]);

    return (
      <React.Fragment>
        {/*we want ScrollPositionManager to be unmounted when router changes because the way it works is to save scroll position
       when unmounted*/}
        <ScrollPositionManager scrollKey="discover" />
        <div
          ref={windowScreenRef}
          className={clsx('', {
            header: whichToUse()?.length > 0,
          })}
          style={{ marginLeft: `${state.drawerWidth + 5}px`, zIndex: state.visible ? -1 : 0 }}
        >
          <If condition={notification === '' && whichToUse()?.length > 0}>
            <Then>
              <MasonryLayoutMemo data={whichToUse()} state={state}>
                {(columnCount: number) => {
                  return Object.keys(whichToUse()).map((key, idx) => (
                    <CardDiscover
                      key={idx}
                      imagesMapDataDiscover={imagesDataDiscover.mapData}
                      columnCount={columnCount}
                      routerProps={routerProps}
                      index={whichToUse()[idx].id}
                      githubData={whichToUse()[idx]}
                      state={stateMemoize()}
                      dispatchStargazersUser={dispatchStargazersUserMemoize()}
                      stateStargazersMemoize={stateStargazersMemoize()}
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
Discover.displayName = 'Discover';
export default Discover;
