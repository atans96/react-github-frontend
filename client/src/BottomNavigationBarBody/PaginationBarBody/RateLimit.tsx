import React, { useEffect, useReducer, useState } from 'react';
import RateLimitInfo from './RateLimitInfoBody/RateLimitInfo';
import { getRateLimitInfo } from '../../services';
import { useApolloFactory } from '../../hooks/useApolloFactory';
import { initialStateRateLimit, reducerRateLimit } from '../../store/RateLimit/reducer';
import { BottomNavigationBarProps } from '../../HomeBody/BottomNavigationBar';
import { useLocation } from 'react-router-dom';

const RateLimit: React.FC<{
  componentProps: Omit<BottomNavigationBarProps, 'dispatchStargazersUser' | 'dispatchShared' | 'stateShared'>;
}> = (props) => {
  const [state, dispatch] = useReducer(reducerRateLimit, initialStateRateLimit);
  const [refetch, setRefetch] = useState(true);
  const displayName: string | undefined = (RateLimit as React.ComponentType<any>).displayName;
  const { userData, userDataLoading, userDataError } = useApolloFactory(displayName!).query.getUserData();
  const location = useLocation();
  useEffect(
    () => {
      // the first time Home component is mounting fetch it, otherwise it will use the data from store and
      // persist when switching the component
      if (location.pathname === '/') {
        dispatch({
          type: 'RATE_LIMIT_ADDED',
          payload: {
            rateLimitAnimationAdded: false,
          },
        });
        getRateLimitInfo(
          !userDataLoading && !userDataError && userData && userData.getUserData ? userData.getUserData.token : ''
        ).then((data) => {
          if (data.rateLimit && data.rateLimitGQL) {
            dispatch({
              type: 'RATE_LIMIT_ADDED',
              payload: {
                rateLimitAnimationAdded: true,
              },
            });
            dispatch({
              type: 'RATE_LIMIT',
              payload: {
                limit: data.rateLimit.limit,
                used: data.rateLimit.used,
                reset: data.rateLimit.reset,
              },
            });

            dispatch({
              type: 'RATE_LIMIT_GQL',
              payload: {
                limit: data.rateLimitGQL.limit,
                used: data.rateLimitGQL.used,
                reset: data.rateLimitGQL.reset,
              },
            });
          }
          setRefetch(false); // turn back to default after setting to true from RateLimitInfo
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      refetch,
      props.componentProps.state.mergedData.length,
      props.componentProps.state.searchUsers.length,
      userDataError,
      userDataLoading,
      userData,
      location.pathname,
    ]
  );
  return (
    <RateLimitInfo
      data={state.rateLimit}
      setRefetch={setRefetch}
      rateLimitAnimationAdded={state.rateLimitAnimationAdded}
    />
  );
};
RateLimit.displayName = 'RateLimit';
export default RateLimit;
