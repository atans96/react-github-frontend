import React, { useEffect, useState } from 'react';
import './RateLimitInfo.css';
import { epochToJsDate } from '../util';
import { IState } from '../typing/interface';
import clsx from 'clsx';

interface RateLimitInfo {
  data: IState['rateLimit'];
  setRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  rateLimitAnimationAdded: boolean;
}

const RateLimitInfo: React.FC<RateLimitInfo> = ({ data, setRefetch, rateLimitAnimationAdded }) => {
  const [resetTime, setResetTime] = useState<string>('');
  useEffect(() => {
    const interval = setInterval(() => {
      setResetTime(epochToJsDate(data.reset));
    }, 1000);
    if (resetTime === '00 second') {
      // prevent the interval to be changed further after hit 00 seconds
      clearInterval(interval);
      setRefetch(true); // setState from parent here so that it will refetch the rate_limit_info again
      setResetTime(''); // setState here to set back the resetTime from '00 second' to '' to be cleared
      // otherwise after setRefetch(true), the condition here won't get hit
    }
    return () => {
      clearInterval(interval);
    };
  }, [data.reset, resetTime, setRefetch]);
  return (
    <div id="container">
      <div
        className={clsx('', {
          added: rateLimitAnimationAdded,
        })}
        id="box"
        style={{ borderRight: '1px solid black' }}
      >
        <span style={{ padding: '10px' }}>LIMIT: {data.limit}</span>
      </div>
      <div
        className={clsx('', {
          added: rateLimitAnimationAdded,
        })}
        id="box"
        style={{ borderRight: '1px solid black' }}
      >
        <span style={{ padding: '10px' }}>USED: {data.used}</span>
      </div>
      <div
        className={clsx('', {
          added: rateLimitAnimationAdded,
        })}
        id="box"
      >
        <span style={{ padding: '10px' }}>RESET IN: {data.reset && resetTime}</span>
      </div>
    </div>
  );
};
export default RateLimitInfo;
