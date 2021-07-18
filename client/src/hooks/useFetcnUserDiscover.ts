import { StaticState } from '../typing/interface';
import { ActionResolvedPromise } from '../typing/type';
import { useRef, useState } from 'react';
import useActionResolvePromise from './useActionResolvePromise';
import { useSelector } from '../selectors/stateSelector';
import { SharedStore } from '../store/Shared/reducer';
import { DiscoverStore } from '../store/Discover/reducer';

interface useFetchUser {
  component: string;
}

const useFetchUser = ({ component }: useFetchUser) => {
  const { perPage } = SharedStore.store().PerPage();
  const { pageDiscover } = DiscoverStore.store().PageDiscover();
  const { actionResolvePromise } = useActionResolvePromise();
  const { suggestedData } = useSelector((data: StaticState) => data.SuggestedRepo);
  // useState is used when the HTML depends on it directly to render something
  const [isLoading, setLoading] = useState(false);
  const paginationRef = useRef(perPage);
  const sortedDataRef = useRef([]);
  const [notification, setNotification] = useState('');
  const isFetchFinish = useRef(false); // indicator to stop fetching when we have no more data
  const fetchUser = () => {
    isFetchFinish.current = false;
    setLoading(true);
    DiscoverStore.dispatch({
      type: 'LAST_PAGE_DISCOVER',
      payload: {
        lastPageDiscover: Math.ceil((suggestedData.getSuggestedRepo.repoInfoSuggested.length || 0) / perPage),
      },
    });
    if (sortedDataRef.current.slice(perPage).length === 0) {
      isFetchFinish.current = actionResolvePromise({
        action: ActionResolvedPromise.noData,
        setLoading,
        setNotification,
        isFetchFinish: isFetchFinish.current,
        displayName: component,
      }).isFetchFinish;
    } else {
      actionResolvePromise({
        action: ActionResolvedPromise.append,
        setLoading,
        setNotification,
        isFetchFinish: isFetchFinish.current,
        displayName: component,
        data: sortedDataRef.current.slice(0, paginationRef.current),
      });
    }
  };

  const fetchUserMore = () => {
    if (!isFetchFinish.current && pageDiscover > 1 && sortedDataRef?.current?.length > 0) {
      setLoading(true); // spawn loading spinner at bottom page
      paginationRef.current += perPage;
      if (sortedDataRef.current.slice(paginationRef.current + perPage).length === 0) {
        isFetchFinish.current = actionResolvePromise({
          action: ActionResolvedPromise.noData,
          setLoading,
          setNotification,
          isFetchFinish: isFetchFinish.current,
          displayName: component,
        }).isFetchFinish;
      } else {
        actionResolvePromise({
          action: ActionResolvedPromise.append,
          setLoading,
          setNotification,
          isFetchFinish: isFetchFinish.current,
          displayName: component,
          data: sortedDataRef.current.slice(paginationRef.current, paginationRef.current + perPage),
        });
      }
    }
  };
  return {
    fetchUserMore,
    fetchUser,
    isLoading,
    notification,
    setNotification,
    setLoading,
  };
};
export default useFetchUser;
