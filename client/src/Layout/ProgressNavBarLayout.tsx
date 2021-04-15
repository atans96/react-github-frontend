import React, { useEffect, useRef } from 'react';
import { useInterval } from '../hooks/useInterval';
interface ProgressNavBarProps {
  nextClickedId: number;
  previousClickedId: number;
  isLeft: number;
  initialProgress?: number;
  steps?: number;
  direction?: string;
}
export const ProgressNavBarLayout: React.FC<ProgressNavBarProps> = ({
  nextClickedId,
  previousClickedId,
  isLeft,
  initialProgress = 1,
  steps = 0.03,
}: any) => {
  let size = Math.max(nextClickedId, previousClickedId) - Math.min(nextClickedId, previousClickedId);
  if (nextClickedId > previousClickedId) {
    size += 1;
  }
  const [progress, setProgress] = React.useState(initialProgress);
  const interval = 1; // 0.05 second
  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  });
  useInterval(
    () => {
      if (Math.abs(progressRef.current) < size) {
        setProgress((prevProgress: number) =>
          isLeft > 0 ? Math.min(size, prevProgress + isLeft * steps) : Math.max(-size, prevProgress + steps * isLeft)
        );
      }
    },
    Math.abs(progressRef.current) < size ? interval : 0
  );

  return (
    <div style={{ position: 'relative' }}>
      <div className={'selection-tabs'} style={{ transform: `scaleX(1)`, position: 'absolute' }} />
      <div
        className={'selection-tabs'}
        style={{ transform: `scaleX(${progress})`, zIndex: 100, position: 'absolute' }}
      />
    </div>
  );
};
