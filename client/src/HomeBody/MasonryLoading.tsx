// only re-render Card component when mergedData and idx changes
// Memo: given the same/always same props, always render the same output
// A common situation that makes a component render with the same props is being forced to render by a parent component.
import { MergedDataProps } from '../typing/type';
import React from 'react';
import MasonryLayout from '../Layout/MasonryLayout';
import CardSkeleton from './CardSkeleton';
import { SharedStore } from '../store/Shared/reducer';
import { HomeStore } from '../store/Home/reducer';

interface MasonryLoading {
  data: MergedDataProps[];
  cardWidth?: number;
  gutter?: number;
}

// if you only include isEqualObjects(prevProps.mergedData.length, nextProps.mergedData.length) as
// propsAreEqual condition checker, the child of Masonry's Card won't get updated state like new tokenGQL when the user logged in using
// LoginGQL component from StargazersCard. We want to memoize masonry since it involves expensive DOM manipulation
const MasonryLoading: React.FC<MasonryLoading> = ({ data, cardWidth = 370, gutter = 8 }) => {
  const { width } = SharedStore.store().Width();
  const { mergedData } = HomeStore.store().MergedData();
  const columnCount = Math.floor(width / (cardWidth + gutter)) || 1;
  return React.useMemo(
    () => (
      <MasonryLayout columns={columnCount}>
        {Object.keys(mergedData).map((_, idx) => (
          <CardSkeleton key={idx} />
        ))}
      </MasonryLayout>
    ),
    [data.length]
  );
};
MasonryLoading.displayName = 'MasonryLoading';
export default MasonryLoading;
