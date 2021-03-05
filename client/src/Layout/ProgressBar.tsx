import React, { useState } from 'react';
import styled from 'styled-components';
import { useInterval } from '../hooks/useBottomHit';
import { useUpdateEffect } from '../hooks/useUpdatedEffect';

export const ProgressBar = ({ progress }: any) => (
  <Container>
    <AnimatedBar style={{ width: progress + '%' }} />
  </Container>
);

const Container = styled.div`
  width: 100%;
  height: 5px;
  ...rest
`;
const AnimatedBar = styled.div`
  height: 5px;
  background-color: var(--iconColor);
  transition: width 500ms ease-in-out;
`;
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
