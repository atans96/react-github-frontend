import React, { useEffect, useRef, useState } from 'react';
import './RateLimit.css';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { useTrackedState, useTrackedStateRateLimit } from '../../../selectors/stateContextSelector';
import { epochToJsDate } from '../../../util';
import { getRateLimitInfo } from '../../../services';
import { parallel } from 'async';

const RateLimit = () => {
  const abortController = new AbortController();
  const [state] = useTrackedState();
  const [, dispatchRateLimit] = useTrackedStateRateLimit();
  const [refetch, setRefetch] = useState(true);
  const [stateRateLimit] = useTrackedStateRateLimit();
  const [resetTime, setResetTime] = useState<string>('');
  const location = useLocation();
  const isFinished = useRef(false);

  useEffect(() => {
    return () => {
      isFinished.current = true;
      abortController.abort(); //cancel the fetch when the user go away from current page or when typing again to search
    };
  }, []);

  const intervalRef = useRef<any>();
  useEffect(() => {
    if (!refetch && !isFinished.current && location.pathname === '/' && stateRateLimit.rateLimit.reset) {
      intervalRef.current = setInterval(() => {
        const { render, ms } = epochToJsDate(stateRateLimit.rateLimit.reset);
        if (render !== '00 second') {
          setResetTime(render);
        } else {
          // prevent the interval to be changed further after hit 00 seconds
          clearInterval(intervalRef.current);
          setRefetch(true); // setState from parent here so that it will refetch the rate_limit_info again
          setResetTime(''); // setState here to set back the resetTime from '00 second' to '' to be cleared
          // otherwise after setRefetch(true), the condition here won't get hit
        }
      }, 1000);
    }
    return () => {
      clearInterval(intervalRef.current);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateRateLimit.rateLimit.reset, refetch]);

  useEffect(
    () => {
      // the first time Home component is mounting fetch it, otherwise it will use the data from store and
      // persist when switching the component
      if (location.pathname === '/' && !isFinished.current) {
        dispatchRateLimit({
          type: 'RATE_LIMIT_ADDED',
          payload: {
            rateLimitAnimationAdded: false,
          },
        });
        getRateLimitInfo({ signal: abortController.signal }).then((data) => {
          if (abortController.signal.aborted) return;
          if (data && !isFinished.current) {
            dispatchRateLimit({
              type: 'RATE_LIMIT_ADDED',
              payload: {
                rateLimitAnimationAdded: true,
              },
            });
            dispatchRateLimit({
              type: 'RATE_LIMIT',
              payload: {
                limit: data.rate.limit,
                used: data.rate.used,
                reset: data.rate.reset,
              },
            });
            dispatchRateLimit({
              type: 'RATE_LIMIT_GQL',
              payload: {
                limit: data.resources.graphql.limit,
                used: data.resources.graphql.used,
                reset: data.resources.graphql.reset,
              },
            });
          }
          if (!isFinished.current) setRefetch(false); // turn back to default after setting to true from RateLimit
        });
        setRefetch(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refetch, state.mergedData.length, state.searchUsers.length]
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
