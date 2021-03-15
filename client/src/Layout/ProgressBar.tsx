import React, { useState } from 'react';
import { useInterval } from '../hooks/useBottomHit';
import { useUpdateEffect } from '../hooks/useUpdatedEffect';

export const ProgressBar = ({ progress }: any) => (
  <div style={{ width: '100%', height: '5px' }}>
    <div
      style={{
        width: progress + '%',
        height: '5px',
        backgroundColor: 'var(--iconColor)',
        transition: 'width 500ms ease-in-out',
      }}
    />
  </div>
);

export const CountDown = ({ pageNumber, duration, interval }: any) => {
  const steps = duration / interval;
  const initialProgress = 100 / steps;
  const [progress, setProgress] = useState(initialProgress);

  useInterval(
    () => {
      if (progress < 100) {
        setProgress((val) => val + initialProgress);
      }
    },
    duration ? interval : 0
  );

  useUpdateEffect(() => {
    setProgress(initialProgress);
  }, [pageNumber, duration]);

  return <ProgressBar progress={progress} />;
};
