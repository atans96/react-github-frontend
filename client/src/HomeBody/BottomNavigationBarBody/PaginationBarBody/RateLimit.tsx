import React, { useEffect, useState } from 'react';
import RateLimitInfo from './RateLimitInfoBody/RateLimitInfo';
import { getRateLimitInfo } from '../../../services';
import { useApolloFactory } from '../../../hooks/useApolloFactory';
import { useLocation } from 'react-router-dom';
import { useTrackedState, useTrackedStateRateLimit } from '../../../selectors/stateContextSelector';
import idx from 'idx';
import { createRenderElement } from '../../../Layout/MasonryLayout';

const RateLimit = () => {
  const [state] = useTrackedState();
  const [, dispatchRateLimit] = useTrackedStateRateLimit();
  const [refetch, setRefetch] = useState(true);
  const displayName: string | undefined = (RateLimit as React.ComponentType<any>).displayName;
  const { userData, userDataLoading, userDataError } = useApolloFactory(displayName!).query.getUserData();
  const location = useLocation();
  useEffect(
    () => {
      // the first time Home component is mounting fetch it, otherwise it will use the data from store and
      // persist when switching the component
      let isFinished = false;
      if (location.pathname === '/' && !isFinished) {
        dispatchRateLimit({
          type: 'RATE_LIMIT_ADDED',
          payload: {
            rateLimitAnimationAdded: false,
          },
        });
        getRateLimitInfo((!userDataLoading && !userDataError && idx(userData, (_) => _.getUserData.token)) || '').then(
          (data) => {
            if (data.rateLimit && data.rateLimitGQL) {
              dispatchRateLimit({
                type: 'RATE_LIMIT_ADDED',
                payload: {
                  rateLimitAnimationAdded: true,
                },
              });
              dispatchRateLimit({
                type: 'RATE_LIMIT',
                payload: {
                  limit: data.rateLimit.limit,
                  used: data.rateLimit.used,
                  reset: data.rateLimit.reset,
                },
              });

              dispatchRateLimit({
                type: 'RATE_LIMIT_GQL',
                payload: {
                  limit: data.rateLimitGQL.limit,
                  used: data.rateLimitGQL.used,
                  reset: data.rateLimitGQL.reset,
                },
              });
            }
            setRefetch(false); // turn back to default after setting to true from RateLimitInfo
          }
        );
        return () => {
          isFinished = true;
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refetch, state.mergedData.length, state.searchUsers.length, userDataError, userDataLoading, userData]
  );
  return createRenderElement(RateLimitInfo, { setRefetch });
};
RateLimit.displayName = 'RateLimit';
export default RateLimit;
