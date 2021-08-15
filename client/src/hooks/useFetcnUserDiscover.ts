import { StaticState } from '../typing/interface';
import { ActionResolvedPromise } from '../typing/type';
import { useRef, useState } from 'react';
import { useTrackedStateDiscover, useTrackedStateShared } from '../selectors/stateContextSelector';
import useActionResolvePromise from './useActionResolvePromise';
import { useSelector } from '../selectors/stateSelector';

interface useFetchUser {
  component: string;
}

const useFetchUser = ({ component }: useFetchUser) => {
  const { actionResolvePromise } = useActionResolvePromise();
  const [stateDiscover, dispatchDiscover] = useTrackedStateDiscover();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const { suggestedData } = useSelector((data: StaticState) => data.SuggestedRepo);
  // useState is used when the HTML depends on it directly to render something
  const [isLoading, setLoading] = useState(false);
  const paginationRef = useRef(stateShared.perPage);
  const sortedDataRef = useRef([]);
  const [notification, setNotification] = useState('');
  const isFetchFinish = useRef(false); // indicator to stop fetching when we have no more data
  const fetchUser = () => {
    isFetchFinish.current = false;
    setLoading(true);
    dispatchDiscover({
      type: 'LAST_PAGE_DISCOVER',
      payload: {
        lastPageDiscover: Math.ceil(
          (suggestedData.getSuggestedRepo.repoInfoSuggested.length || 0) / stateShared.perPage
        ),
      },
    });
    if (sortedDataRef.current.slice(stateShared.perPage).length === 0) {
      isFetchFinish.current = actionResolvePromise({
        action: ActionResolvedPromise.noData,
        username: stateShared.queryUsername,
        setLoading,
        setNotification,
        isFetchFinish: isFetchFinish.current,
        displayName: component,
      }).isFetchFinish;
    } else {
      actionResolvePromise({
        action: ActionResolvedPromise.append,
        username: stateShared.queryUsername,
        setLoading,
        setNotification,
        isFetchFinish: isFetchFinish.current,
        displayName: component,
        data: sortedDataRef.current.slice(0, paginationRef.current),
      });
    }
  };

  const fetchUserMore = () => {
    if (!isFetchFinish.current && stateDiscover.pageDiscover > 1 && sortedDataRef?.current?.length > 0) {
      setLoading(true); // spawn loading spinner at bottom page
      paginationRef.current += stateShared.perPage;
      if (sortedDataRef.current.slice(paginationRef.current + stateShared.perPage).length === 0) {
        isFetchFinish.current = actionResolvePromise({
          action: ActionResolvedPromise.noData,
          username: stateShared.queryUsername,
          setLoading,
          setNotification,
          isFetchFinish: isFetchFinish.current,
          displayName: component,
        }).isFetchFinish;
      } else {
        actionResolvePromise({
          action: ActionResolvedPromise.append,
          username: stateShared.queryUsername,
          setLoading,
          setNotification,
          isFetchFinish: isFetchFinish.current,
          displayName: component,
          data: sortedDataRef.current.slice(paginationRef.current, paginationRef.current + stateShared.perPage),
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
    stateDiscover,
    dispatchDiscover,
    stateShared,
    dispatchShared,
  };
};
export default useFetchUser;
