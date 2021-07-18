// only re-render Card component when mergedData and idx changes
// Memo: given the same/always same props, always render the same output
// A common situation that makes a component render with the same props is being forced to render by a parent component.
import { MergedDataProps } from '../typing/type';
import React from 'react';
import MasonryLayout from '../Layout/MasonryLayout';
import { useTrackedState, useTrackedStateShared } from '../selectors/stateContextSelector';
import CardSkeleton from './CardSkeleton';

interface MasonryLoading {
  data: MergedDataProps[];
  cardWidth?: number;
  gutter?: number;
}

// if you only include isEqualObjects(prevProps.mergedData.length, nextProps.mergedData.length) as
// propsAreEqual condition checker, the child of Masonry's Card won't get updated state like new tokenGQL when the user logged in using
// LoginGQL component from StargazersCard. We want to memoize masonry since it involves expensive DOM manipulation
const MasonryLoading: React.FC<MasonryLoading> = ({ data, cardWidth = 370, gutter = 8 }) => {
  const [stateShared] = useTrackedStateShared();
  const [state] = useTrackedState();
  const columnCount = Math.floor(stateShared.width / (cardWidth + gutter)) || 1;
  return React.useMemo(
    () => (
      <MasonryLayout columns={columnCount}>
        {Object.keys(state.mergedData).map((_, idx) => (
          <CardSkeleton key={idx} />
        ))}
      </MasonryLayout>
    ),
    [
      data.length,
      stateShared.tokenGQL,
      stateShared.isLoggedIn,
      stateShared.width,
      stateShared.perPage,
      stateShared.width,
      state.imagesData,
    ]
  );
};
MasonryLoading.displayName = 'MasonryLoading';
export default MasonryLoading;
