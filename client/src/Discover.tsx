import React, { useEffect, useRef, useState } from 'react';
import { MergedDataProps, RenderImages, SeenProps } from './typing/type';
import { Then } from './util/react-if/Then';
import { If } from './util/react-if/If';
import clsx from 'clsx';
import useBottomHit from './hooks/useBottomHit';
import { sortedRepoInfoSelector, starRankingFilteredSelector, useSelector } from './selectors/stateSelector';
import { useApolloFactory } from './hooks/useApolloFactory';
import { noop } from './util/util';
import eye from './new_16-2.gif';
import { StaticState } from './typing/interface';
import { useScrollSaver } from './hooks/useScrollSaver';
import useResizeObserver from './hooks/useResizeObserver';
import Loadable from 'react-loadable';
import useFetchUser from './hooks/useFetcnUserDiscover';
import { Redirect, useLocation } from 'react-router-dom';
import { useStableCallback } from './util';
import { useDeepMemo } from './hooks/useDeepMemo';
import './Discover.scss';
import Empty from './Layout/EmptyLayout';
import { SharedStore } from './store/Shared/reducer';
import { DiscoverStore } from './store/Discover/reducer';

const ScrollToTopLayout = Loadable({
  loading: Empty,
  loader: () => import(/* webpackChunkName: "ScrollToTopLayoutDiscover" */ './Layout/ScrollToTopLayout'),
  delay: 300,
});

const MasonryCard = Loadable({
  loading: Empty,
  loader: () => import(/* webpackChunkName: "MasonryCardDiscover" */ './DiscoverBody/MasonryCard'),
  delay: 300,
});

const Discover = () => {
  const { mergedDataDiscover } = DiscoverStore.store().MergedDataDiscover();
  const { pageDiscover } = DiscoverStore.store().PageDiscover();
  const { isLoadingDiscover } = DiscoverStore.store().IsLoadingDiscover();
  const { notificationDiscover } = DiscoverStore.store().NotificationDiscover();
  const { filterMergedDataDiscover } = DiscoverStore.store().FilterMergedDataDiscover();
  const { visibleDiscover } = DiscoverStore.store().VisibleDiscover();

  const { width } = SharedStore.store().Width();
  const { isLoggedIn } = SharedStore.store().IsLoggedIn();

  const location = useLocation();
  const { fetchUserMore, fetchUser, isLoading, notification, setNotification, setLoading } = useFetchUser({
    component: 'Discover',
  });
  const displayName: string | undefined = (Discover as React.ComponentType<any>).displayName;
  const seenAdded = useApolloFactory(displayName!).mutation.seenAdded;
  const { suggestedData, suggestedDataLoading, suggestedDataError } = useSelector(
    (data: StaticState) => data.SuggestedRepo
  );
  // useState is used when the HTML depends on it directly to render something
  const sortedDataRef = useRef([]);
  const isFetchFinish = useRef(false); // indicator to stop fetching when we have no more data
  const windowScreenRef = useRef<HTMLDivElement>(null);

  const [sortedClicked, setSortedClicked] = useState('Daily');
  const starRankingFiltered: any[] = useSelector(starRankingFilteredSelector(sortedClicked));
  sortedDataRef.current = useSelector(sortedRepoInfoSelector(starRankingFiltered, sortedClicked));

  const suggestedDataImages = useSelector((data: StaticState) => data.SuggestedRepoImages);
  const imagesDataDiscover: {
    mapData: Map<number, RenderImages>;
    arrayData: [RenderImages] | any[];
  } = useDeepMemo(() => {
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
  }, [suggestedDataImages?.suggestedDataImages?.getSuggestedRepoImages?.renderImages]);

  const isLoadingRef = useRef<boolean>(true);
  const mergedDataRef = useRef<any[]>([]);
  const notificationRef = useRef<string>('');
  const imagesDataDiscoverRef = useRef<any>();

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/discover' && !isFinished) {
      mergedDataRef.current = mergedDataDiscover;
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedDataDiscover]);

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
  const locationRef = useRef('/discover');
  useEffect(() => {
    locationRef.current = location.pathname;
  });
  const handleBottomHit = useStableCallback(() => {
    if (
      !isFetchFinish.current &&
      mergedDataRef.current.length > 0 &&
      !isLoadingRef.current &&
      locationRef.current === '/discover' &&
      notificationRef.current === ''
    ) {
      DiscoverStore.dispatch({ type: 'ADVANCE_PAGE_DISCOVER' });
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
        seenAdded(result).then(noop);
      }
    }
  });

  useBottomHit(
    windowScreenRef,
    handleBottomHit,
    isLoading || isFetchFinish.current // include isFetchFinish to indicate not to listen anymore
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
  useEffect(() => {
    DiscoverStore.dispatch({ type: 'MERGED_DATA_APPEND_DISCOVER_EMPTY' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (pageDiscover > 1 && notification === '' && !isFinished) {
      fetchUserMore();
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageDiscover]);

  useEffect(() => {
    let isFinished = false;
    if (!isFinished) {
      setLoading(isLoadingDiscover);
      setNotification(notificationDiscover);
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingDiscover, notificationDiscover]);

  const whichToUse = () => {
    // useCallback will avoid unnecessary child re-renders due to something changing in the parent that
    // is not part of the dependencies for the callback.
    if (filterMergedDataDiscover.length > 0) {
      isFetchFinish.current = true;
      return filterMergedDataDiscover;
    }
    isFetchFinish.current = false;
    return mergedDataDiscover; // return this if filteredTopics.length === 0
  };
  //TODO: only show image if size is....https://github.com/ShogunPanda/fastimage at backend
  useScrollSaver(location.pathname, '/discover');
  if (isLoggedIn) return <Redirect to={'/login'} from={'/discover'} />;
  return (
    <React.Fragment>
      {/*we want ScrollPositionManager to be unmounted when router changes because the way it works is to save scroll position
       when unmounted*/}
      <div className={'top'} />
      <div
        ref={windowScreenRef}
        className={clsx('', {
          header: whichToUse()?.length > 0,
        })}
        style={{
          zIndex: visibleDiscover ? -1 : 0,
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
        {notification === '' && whichToUse()?.length > 0 && (
          <MasonryCard data={whichToUse()} imagesDataDiscover={imagesDataDiscover} sorted={sortedClicked} />
        )}

        <If
          condition={
            !suggestedDataError &&
            !suggestedDataLoading &&
            !suggestedData.suggestedData.getSuggestedRepo.repoInfoSuggested.length
          }
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
      {whichToUse()?.length > 0 && <ScrollToTopLayout />}
    </React.Fragment>
  );
};
Discover.displayName = 'Discover';
export default Discover;
