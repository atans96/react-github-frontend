import React, { useCallback, useEffect, useRef, useState } from 'react';
import MasonryLayout, { createRenderElement } from './Layout/MasonryLayout';
import { useResizeHandler } from './hooks/hooks';
import { ActionResolvedPromise, MergedDataProps, RenderImages, SeenProps } from './typing/type';
import ScrollPositionManager from './util/scrollPositionSaver';
import { Then } from './util/react-if/Then';
import { If } from './util/react-if/If';
import clsx from 'clsx';
import useBottomHit from './hooks/useBottomHit';
import { isEqualObjects } from './util';
import { useLocation } from 'react-router-dom';
import CardDiscover from './DiscoverBody/CardDiscover';
import { sortedRepoInfoSelector, starRankingFilteredSelector, useSelector } from './selectors/stateSelector';
import { useApolloFactory } from './hooks/useApolloFactory';
import { noop } from './util/util';
import eye from './new_16-2.gif';
import { useTrackedStateDiscover, useTrackedStateShared } from './selectors/stateContextSelector';
import idx from 'idx';
import PaginationBarDiscover from './DiscoverBody/PaginationBarDiscover';
import { ActionResolvePromiseOutput, IStateDiscover, IStateShared, StaticState } from './typing/interface';
import { Fab } from '@material-ui/core';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { ScrollTopLayout } from './Layout/ScrollToTopLayout';

interface MasonryLayoutMemo {
  children: any;
  data: IStateDiscover['mergedDataDiscover'];
  stateDiscover: IStateDiscover;
  stateShared: IStateShared;
  sorted: string;
}

const MasonryLayoutMemo = React.memo<MasonryLayoutMemo>(
  ({ children, data, stateDiscover, stateShared }) => {
    let columnCount = 0;
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
      isEqualObjects(prevProps.stateDiscover.mergedDataDiscover, nextProps.stateDiscover.mergedDataDiscover) &&
      isEqualObjects(prevProps.stateShared.width, nextProps.stateShared.width) &&
      isEqualObjects(prevProps.sorted, nextProps.sorted)
    ); // when the component receives updated data from state such as load more, or clicked to login to access graphql
    // it needs to get re-render to get new data.
  }
);
MasonryLayoutMemo.displayName = 'MasonryLayoutMemo';

const Discover: React.FC<ActionResolvePromiseOutput> = React.memo(({ actionResolvePromise }) => {
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [stateDiscover, dispatchDiscover] = useTrackedStateDiscover();
  const displayName: string | undefined = (Discover as React.ComponentType<any>).displayName;
  const seenAdded = useApolloFactory(displayName!).mutation.seenAdded;
  const { suggestedData, suggestedDataLoading, suggestedDataError } = useSelector(
    (data: StaticState) => data.SuggestedRepo
  );
  const location = useLocation();
  // useState is used when the HTML depends on it directly to render something
  const [isLoading, setLoading] = useState(false);
  const paginationRef = useRef(stateShared.perPage);
  const sortedDataRef = useRef([]);
  const [notification, setNotification] = useState('');
  const isFetchFinish = useRef(false); // indicator to stop fetching when we have no more data
  const windowScreenRef = useRef<HTMLDivElement>(null);
  const fetchUserMore = () => {
    if (!isFetchFinish.current && stateDiscover.pageDiscover > 1 && sortedDataRef?.current?.length > 0) {
      setLoading(true); // spawn loading spinner at bottom page
      paginationRef.current += stateShared.perPage;
      if (sortedDataRef.current.slice(paginationRef.current + stateShared.perPage).length === 0) {
        isFetchFinish.current = actionResolvePromise({
          action: ActionResolvedPromise.noData,
          setLoading,
          setNotification,
          isFetchFinish: isFetchFinish.current,
          displayName: displayName!,
        }).isFetchFinish;
      } else {
        actionResolvePromise({
          action: ActionResolvedPromise.append,
          setLoading,
          setNotification,
          isFetchFinish: isFetchFinish.current,
          displayName: displayName!,
          data: sortedDataRef.current.slice(paginationRef.current, paginationRef.current + stateShared.perPage),
        });
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
        lastPageDiscover: Math.ceil(
          idx(suggestedData, (_) => _.getSuggestedRepo.repoInfo.length) ?? 0 / stateShared.perPage
        ),
      },
    });
    if (sortedDataRef.current.slice(stateShared.perPage).length === 0) {
      isFetchFinish.current = actionResolvePromise({
        action: ActionResolvedPromise.noData,
        setLoading,
        setNotification,
        isFetchFinish: isFetchFinish.current,
        displayName: displayName!,
      }).isFetchFinish;
    } else {
      actionResolvePromise({
        action: ActionResolvedPromise.append,
        setLoading,
        setNotification,
        isFetchFinish: isFetchFinish.current,
        displayName: displayName!,
        data: sortedDataRef.current.slice(0, paginationRef.current),
      });
    }
  };

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
  const mergedDataRef = useRef<any[]>([]);
  const notificationRef = useRef<string>('');
  const imagesDataDiscoverRef = useRef<any>();

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/discover' && !isFinished) {
      mergedDataRef.current = stateDiscover.mergedDataDiscover;
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateDiscover.mergedDataDiscover]);

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/discover' && !isFinished) {
      isLoadingRef.current = isLoading;
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/discover' && !isFinished) {
      notificationRef.current = notification;
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification]);

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/discover' && !isFinished) {
      imagesDataDiscoverRef.current = imagesDataDiscover;
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesDataDiscover]);

  const handleBottomHit = useCallback(
    () => {
      if (
        !isFetchFinish.current &&
        mergedDataRef.current.length > 0 &&
        !isLoadingRef.current &&
        location.pathname === '/discover' &&
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
                imagesDataDiscoverRef.current.arrayData
                  .filter((xx: RenderImages) => xx.id === obj.id)
                  .map((obj: RenderImages) => [...obj.value])[0] ?? [],
              name: obj.name,
              is_queried: false,
            }
          );
          acc.push(temp);
          return acc;
        }, [] as SeenProps[]);
        if (result.length > 0 && imagesDataDiscoverRef.current.mapData.size > 0) {
          //don't add to database yet when imagesData still loading.
          seenAdded({
            variables: {
              seenCards: result,
            },
          }).then(noop);
        }
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    []
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

  useResizeHandler(windowScreenRef, handleResize);
  useEffect(() => {
    dispatchDiscover({ type: 'MERGED_DATA_APPEND_DISCOVER_EMPTY' });
  }, [sortedClicked]);
  useEffect(() => {
    let isFinished = false;
    // when the username changes, that means the user submit form at SearchBar.js + dispatchMergedDataDiscover([]) there
    if (
      !suggestedDataLoading &&
      !!suggestedData?.getSuggestedRepo &&
      !suggestedDataError &&
      location.pathname === '/discover' &&
      !isFinished
    ) {
      fetchUser();
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedDataLoading, suggestedDataError, sortedClicked]);

  useEffect(() => {
    let isFinished = false;
    if (stateDiscover.pageDiscover > 1 && notification === '' && !isFinished) {
      fetchUserMore();
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateDiscover.pageDiscover]);

  useEffect(() => {
    let isFinished = false;
    if (!isFinished) {
      setLoading(stateDiscover.isLoadingDiscover);
      setNotification(stateDiscover.notificationDiscover);
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  //TODO: only show image if size is....https://github.com/ShogunPanda/fastimage at backend

  return (
    <React.Fragment>
      {/*we want ScrollPositionManager to be unmounted when router changes because the way it works is to save scroll position
       when unmounted*/}
      <ScrollPositionManager scrollKey="discover" />
      <div className={'top'} />
      <div
        ref={windowScreenRef}
        className={clsx('', {
          header: whichToUse()?.length > 0,
        })}
        style={{
          zIndex: stateDiscover.visibleDiscover ? -1 : 0,
        }}
      >
        <header className={'header-discover'}>
          <nav className={'navbar-nav'}>
            <li
              className={clsx('nav-item', {
                active: sortedClicked === 'Daily',
              })}
              onClick={(e) => setSortedClicked(e.currentTarget.innerText)}
            >
              <a
                className={clsx('', {
                  active: sortedClicked === 'Daily',
                })}
                style={{ lineHeight: '50px' }}
              >
                Daily
              </a>
            </li>
            <li
              className={clsx('nav-item', {
                active: sortedClicked === 'Weekly',
              })}
              onClick={(e) => setSortedClicked(e.currentTarget.innerText)}
            >
              <a
                className={clsx('', {
                  active: sortedClicked === 'Weekly',
                })}
                style={{ lineHeight: '50px' }}
              >
                Weekly
              </a>
            </li>
            <li
              className={clsx('nav-item', {
                active: sortedClicked === 'Monthly',
              })}
              onClick={(e) => setSortedClicked(e.currentTarget.innerText)}
            >
              <a
                className={clsx('', {
                  active: sortedClicked === 'Monthly',
                })}
                style={{ lineHeight: '50px' }}
              >
                Monthly
              </a>
            </li>
            <li
              className={clsx('nav-item', {
                active: sortedClicked === 'Quarterly',
              })}
              onClick={(e) => setSortedClicked(e.currentTarget.innerText)}
            >
              <a
                className={clsx('', {
                  active: sortedClicked === 'Quarterly',
                })}
                style={{ lineHeight: '50px' }}
              >
                Quarterly
              </a>
            </li>
            <li
              className={clsx('nav-item', {
                active: sortedClicked === 'Yearly',
              })}
              onClick={(e) => setSortedClicked(e.currentTarget.innerText)}
            >
              <a
                className={clsx('', {
                  active: sortedClicked === 'Yearly',
                })}
                style={{ lineHeight: '50px' }}
              >
                Yearly
              </a>
            </li>
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
                return Object.keys(whichToUse()).map((key, idx) =>
                  createRenderElement(CardDiscover, {
                    key: whichToUse()[idx].id,
                    columnCount,
                    imagesMapDataDiscover: imagesDataDiscover.mapData,
                    index: whichToUse()[idx].id,
                    githubData: whichToUse()[idx],
                  })
                );
              }}
            </MasonryLayoutMemo>
          </Then>
        </If>
        <If
          condition={idx(
            suggestedData,
            (_) => !suggestedDataError && !suggestedDataLoading && !_.suggestedData.getSuggestedRepo.repoInfo.length
          )}
        >
          <Then>
            <div style={{ textAlign: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <h3>Sorry we don't have the data yet!</h3>
              </div>
            </div>
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
      <ScrollTopLayout>
        <Fab color="secondary" size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon style={{ transform: 'scale(1.5)' }} />
        </Fab>
      </ScrollTopLayout>
      <If condition={stateShared.width > 1100}>
        <Then>{createRenderElement(PaginationBarDiscover, {})}</Then>
      </If>
    </React.Fragment>
  );
});
Discover.displayName = 'Discover';
export default Discover;
