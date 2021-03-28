import React, { useCallback, useEffect, useRef, useState } from 'react';
import MasonryLayout from './Layout/MasonryLayout';
import { useResizeHandler } from './hooks/hooks';
import { IAction, IDataOne, IStateDiscover, IStateShared, StaticState } from './typing/interface';
import { MergedDataProps, Nullable, RenderImages, SeenProps } from './typing/type';
import ScrollPositionManager from './util/scrollPositionSaver';
import { Then } from './util/react-if/Then';
import { If } from './util/react-if/If';
import clsx from 'clsx';
import useBottomHit from './hooks/useBottomHit';
import { debounce, isEqualObjects } from './util';
import { RouteComponentProps } from 'react-router-dom';
import CardDiscover from './HomeBody/CardDiscover';
import BottomNavigationBarDiscover from './HomeBody/BottomNavigationBarDiscover';
import { sortedRepoInfoSelector, starRankingFilteredSelector, useSelector } from './selectors/stateSelector';
import { useApolloFactory } from './hooks/useApolloFactory';
import { noop } from './util/util';
import eye from './new_16-2.gif';
import { ActionDiscover } from './store/Discover/reducer';
import { ActionShared } from './store/Shared/reducer';
import { ActionStargazers } from './store/Staargazers/reducer';
import { ActionResolvedPromise } from './Global';

interface MasonryLayoutMemo {
  children: any;
  data: IStateDiscover['mergedDataDiscover'];
  stateDiscover: IStateDiscover;
  stateShared: IStateShared;
  sorted: string;
}

const MasonryLayoutMemo = React.memo<MasonryLayoutMemo>(
  ({ children, data, stateDiscover, stateShared }) => {
    let columnCount = 1;
    let increment = 300;
    const baseWidth = 760;
    if (stateShared.width > 760) {
      while (baseWidth + increment <= stateShared.width) {
        columnCount += 1;
        increment += 300;
      }
    }
    return <MasonryLayout columns={columnCount}>{children(columnCount)}</MasonryLayout>;
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.data.length, nextProps.data.length) &&
      isEqualObjects(prevProps.stateDiscover.imagesDataDiscover, nextProps.stateDiscover.imagesDataDiscover) &&
      isEqualObjects(prevProps.stateDiscover.widthDiscover, nextProps.stateDiscover.widthDiscover) &&
      isEqualObjects(prevProps.stateShared.width, nextProps.stateShared.width) &&
      isEqualObjects(prevProps.sorted, nextProps.sorted)
    ); // when the component receives updated data from state such as load more, or clicked to login to access graphql
    // it needs to get re-render to get new data.
  }
);
MasonryLayoutMemo.displayName = 'MasonryLayoutMemo';

interface Output {
  isFetchFinish: boolean;
}

interface DiscoverProps {
  stateDiscover: IStateDiscover;
  stateShared: IStateShared;
  dispatchDiscover: React.Dispatch<IAction<ActionDiscover>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
  dispatchStargazers: React.Dispatch<IAction<ActionStargazers>>;
  routerProps: RouteComponentProps<Record<string, any>, Record<string, any>, Record<string, any>>;
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
const Discover = React.memo<DiscoverProps>(
  ({
    stateDiscover,
    stateShared,
    dispatchDiscover,
    routerProps,
    dispatchShared,
    dispatchStargazers,
    actionResolvedPromise,
  }) => {
    const displayName: string | undefined = (Discover as React.ComponentType<any>).displayName;
    const seenAdded = useApolloFactory(displayName!).mutation.seenAdded;
    const { suggestedData, suggestedDataLoading, suggestedDataError } = useSelector(
      (data: StaticState) => data.SuggestedRepo
    );
    // useState is used when the HTML depends on it directly to render something
    const [isLoading, setLoading] = useState(false);
    const paginationRef = useRef(stateShared.perPage);
    const sortedDataRef = useRef([]);
    const [notification, setNotification] = useState('');
    const isFetchFinish = useRef(false); // indicator to stop fetching when we have no more data
    const windowScreenRef = useRef<HTMLDivElement>(null);
    const fetchUserMore = () => {
      if (!isFetchFinish.current && stateDiscover.pageDiscover > 1) {
        setLoading(true); // spawn loading spinner at bottom page
        paginationRef.current += stateShared.perPage;
        if (sortedDataRef.current.slice(0, paginationRef.current + stateShared.perPage).length === 0) {
          isFetchFinish.current = actionResolvedPromise(
            ActionResolvedPromise.noData,
            setLoading,
            setNotification,
            isFetchFinish.current,
            displayName!
          ).isFetchFinish;
        } else {
          actionResolvedPromise(
            ActionResolvedPromise.append,
            setLoading,
            setNotification,
            isFetchFinish.current,
            displayName!,
            sortedDataRef.current.slice(0, paginationRef.current + stateShared.perPage)
          );
        }
      }
    };

    const [sortedClicked, setSortedClicked] = useState('Daily');
    const starRankingFiltered: any[] = useSelector(starRankingFilteredSelector(sortedClicked));
    sortedDataRef.current = useSelector(sortedRepoInfoSelector(starRankingFiltered, sortedClicked));

    const fetchUser = () => {
      isFetchFinish.current = false;
      setLoading(true);
      dispatchDiscover({
        type: 'LAST_PAGE_DISCOVER',
        payload: {
          lastPageDiscover: Math.ceil(suggestedData?.getSuggestedRepo?.repoInfo?.length / stateShared.perPage),
        },
      });
      if (sortedDataRef.current.slice(0, stateShared.perPage).length === 0) {
        isFetchFinish.current = actionResolvedPromise(
          ActionResolvedPromise.noData,
          setLoading,
          setNotification,
          isFetchFinish.current,
          displayName!
        ).isFetchFinish;
      } else {
        actionResolvedPromise(
          ActionResolvedPromise.append,
          setLoading,
          setNotification,
          isFetchFinish.current,
          displayName!,
          sortedDataRef.current.slice(0, stateShared.perPage)
        );
      }
    };

    const mergedDataRef = useRef<any[]>([]);
    const suggestedDataImages = useSelector((data: StaticState) => data.SuggestedRepoImages);
    const imagesDataDiscover:
      | { mapData: Map<number, RenderImages>; arrayData: [RenderImages] | any[] }
      | Map<any, any> = React.useMemo(() => {
      //return it to hashMap
      if (
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
    }, [suggestedDataImages]);

    const isLoadingRef = useRef<boolean>(true);
    const notificationRef = useRef<string>('');
    useEffect(() => {
      mergedDataRef.current = stateDiscover.mergedDataDiscover;
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
          dispatchDiscover({ type: 'ADVANCE_PAGE_DISCOVER' });
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
          if (result.length > 0 && imagesDataDiscover.mapData.size > 0) {
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
      ]
    );

    useBottomHit(
      windowScreenRef,
      handleBottomHit,
      isLoading || isFetchFinish.current // include isFetchFinish to indicate not to listen anymore
    );

    function handleResize() {
      dispatchShared({
        type: 'SET_WIDTH',
        payload: {
          width: window.innerWidth,
        },
      });
    }

    useResizeHandler(windowScreenRef, debounce(handleResize));
    useEffect(() => {
      // when the username changes, that means the user submit form at SearchBar.js + dispatchMergedDataDiscover([]) there
      if (!suggestedDataLoading && !!suggestedData?.getSuggestedRepo && !suggestedDataError) {
        fetchUser();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [suggestedDataLoading, suggestedDataError, sortedClicked]);

    useEffect(() => {
      if (stateDiscover.pageDiscover > 1 && notification === '') {
        fetchUserMore();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateDiscover.pageDiscover]);

    const stateMemoize = useCallback(() => {
      return stateDiscover;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateDiscover]);

    const stateBottomNavigationBarMemoize = useCallback(() => {
      return stateDiscover;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateDiscover.pageDiscover, stateDiscover.lastPageDiscover]);

    useEffect(() => {
      setLoading(stateDiscover.isLoadingDiscover);
      setNotification(stateDiscover.notificationDiscover);
    }, [stateDiscover.isLoadingDiscover, stateDiscover.notificationDiscover]);

    const whichToUse = () => {
      // useCallback will avoid unnecessary child re-renders due to something changing in the parent that
      // is not part of the dependencies for the callback.
      if (stateDiscover.filterMergedDataDiscover.length > 0) {
        isFetchFinish.current = true;
        return stateDiscover.filterMergedDataDiscover;
      }
      isFetchFinish.current = false;
      return stateDiscover.mergedDataDiscover; // return this if filteredTopics.length === 0
    };

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
          style={{ marginLeft: `${stateShared.drawerWidth + 5}px`, zIndex: stateDiscover.visibleDiscover ? -1 : 0 }}
        >
          <header className={'header-discover'}>
            <nav>
              <a
                className={clsx('', {
                  underline: sortedClicked === 'Daily',
                })}
                onClick={(e) => setSortedClicked(e.currentTarget.innerText)}
              >
                Daily
              </a>
              <a
                className={clsx('', {
                  underline: sortedClicked === 'Weekly',
                })}
                onClick={(e) => setSortedClicked(e.currentTarget.innerText)}
              >
                Weekly
              </a>
              <a
                className={clsx('', {
                  underline: sortedClicked === 'Monthly',
                })}
                onClick={(e) => setSortedClicked(e.currentTarget.innerText)}
              >
                Monthly
              </a>
              <a
                className={clsx('', {
                  underline: sortedClicked === 'Yearly',
                })}
                onClick={(e) => setSortedClicked(e.currentTarget.innerText)}
              >
                Yearly
              </a>
            </nav>
          </header>
          <If condition={notification === '' && whichToUse()?.length > 0}>
            <Then>
              <MasonryLayoutMemo
                data={whichToUse()}
                stateDiscover={stateDiscover}
                sorted={sortedClicked}
                stateShared={stateShared}
              >
                {(columnCount: number) => {
                  return Object.keys(whichToUse()).map((key, idx) => (
                    <CardDiscover
                      key={idx}
                      sorted={sortedClicked}
                      imagesMapDataDiscover={imagesDataDiscover.mapData}
                      columnCount={columnCount}
                      routerProps={routerProps}
                      index={whichToUse()[idx].id}
                      githubData={whichToUse()[idx]}
                      stateDiscover={stateMemoize()}
                      dispatchShared={dispatchShared}
                      dispatchStargazers={dispatchStargazers}
                      dispatchDiscover={dispatchDiscover}
                    />
                  ));
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
            <BottomNavigationBarDiscover stateDiscover={stateBottomNavigationBarMemoize()} />
          </Then>
        </If>
      </React.Fragment>
    );
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.path, nextProps.path) &&
      isEqualObjects(prevProps.stateShared.perPage, nextProps.stateShared.perPage) &&
      isEqualObjects(prevProps.stateShared.drawerWidth, nextProps.stateShared.drawerWidth) &&
      isEqualObjects(prevProps.stateShared.width, nextProps.stateShared.width) &&
      isEqualObjects(prevProps.stateDiscover, nextProps.stateDiscover)
    );
  }
);
Discover.displayName = 'Discover';
export default Discover;
