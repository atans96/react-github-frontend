import React, { useRef } from 'react';
import ImagesCard from './ImagesCard';
import { IState } from '../../typing/interface';

export interface ImagesCardWrapperProps {
  isVisible: boolean;
  index: string;
  state: IState;
}

const ImagesCardWrapper = React.memo<ImagesCardWrapperProps>(({ isVisible, index, state }) => {
  const isVisibleRef = useRef(false);
  const isVisibleMemo = React.useCallback(() => {
    if (isVisible && !isVisibleRef.current) {
      // prevent changing isVisible status again so to prevent wasted re-rendering to ImagesCard
      isVisibleRef.current = isVisible;
      return isVisibleRef.current;
    }
    return isVisibleRef.current;
  }, [isVisible]);
  return <ImagesCard index={index} visible={isVisibleMemo()} state={state} />;
});
export default ImagesCardWrapper;
