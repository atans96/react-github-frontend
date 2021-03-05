import React, { useRef } from 'react';
import { IState } from '../../typing/interface';
import ImagesCardDiscover from './ImagesCardDiscover';

export interface ImagesCardWrapperDiscoverProps {
  isVisible: boolean;
  index: string;
  state: IState;
}

const ImagesCardWrapperDiscover = React.memo<ImagesCardWrapperDiscoverProps>(({ isVisible, index, state }) => {
  const isVisibleRef = useRef(false);
  const isVisibleMemo = React.useCallback(() => {
    if (isVisible && !isVisibleRef.current) {
      // prevent changing isVisible status again so to prevent wased re-rendering to ImagesCard
      isVisibleRef.current = isVisible;
      return isVisibleRef.current;
    }
    return isVisibleRef.current;
  }, [isVisible]);
  return <ImagesCardDiscover index={index} visible={isVisibleMemo()} state={state} />;
});
export default ImagesCardWrapperDiscover;
