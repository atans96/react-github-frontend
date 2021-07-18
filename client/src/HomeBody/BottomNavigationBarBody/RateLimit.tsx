import React, { useEffect, useState } from 'react';
import './RateLimit.css';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { useTrackedState, useTrackedStateRateLimit } from '../../selectors/stateContextSelector';
import { useApolloFactory } from '../../hooks/useApolloFactory';
import { epochToJsDate } from '../../util';
import { getRateLimitInfo } from '../../services';

const RateLimit = () => {
  const [state] = useTrackedState();
  const [, dispatchRateLimit] = useTrackedStateRateLimit();
  const [refetch, setRefetch] = useState(true);
  const displayName: string | undefined = (RateLimit as unknown as React.ComponentType<any>).displayName;
  const { userData, userDataLoading, userDataError } = useApolloFactory(displayName!).query.getUserData();
  const [stateRateLimit] = useTrackedStateRateLimit();
  const [resetTime, setResetTime] = useState<string>('');
  const location = useLocation();
  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/') {
      const interval = setInterval(() => {
        setResetTime(epochToJsDate(stateRateLimit.rateLimit.reset));
      }, 1000);
      if (resetTime === '00 second') {
        // prevent the interval to be changed further after hit 00 seconds
        clearInterval(interval);
        setRefetch(true); // setState from parent here so that it will refetch the rate_limit_info again
        setResetTime(''); // setState here to set back the resetTime from '00 second' to '' to be cleared
        // otherwise after setRefetch(true), the condition here won't get hit
      }
      return () => {
        isFinished = true;
        clearInterval(interval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateRateLimit.rateLimit.reset, resetTime]);
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
        getRateLimitInfo().then((data) => {
          if (data) {
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
          setRefetch(false); // turn back to default after setting to true from RateLimit
        });
        return () => {
          isFinished = true;
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refetch, state.mergedData.length, state.searchUsers.length, userDataError, userDataLoading, userData]
  );
  return (
    <div id="container">
      <div
        className={clsx('', {
          added: stateRateLimit.rateLimitAnimationAdded,
        })}
        id="box"
        style={{ borderRight: '1px solid black' }}
      >
        <span style={{ padding: '10px' }}>LIMIT: {stateRateLimit.rateLimit.limit}</span>
      </div>
      <div
        className={clsx('', {
          added: stateRateLimit.rateLimitAnimationAdded,
        })}
        id="box"
        style={{ borderRight: '1px solid black' }}
      >
        <span style={{ padding: '10px' }}>USED: {stateRateLimit.rateLimit.used}</span>
      </div>
      <div
        className={clsx('', {
          added: stateRateLimit.rateLimitAnimationAdded,
        })}
        id="box"
      >
        <span style={{ padding: '10px' }}>RESET IN: {stateRateLimit.rateLimit.reset && resetTime}</span>
      </div>
    </div>
  );
};
RateLimit.displayName = 'RateLimit';
export default RateLimit;
