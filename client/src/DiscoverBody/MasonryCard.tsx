import { RenderImages } from '../typing/type';
import React from 'react';
import MasonryLayout from '../Layout/MasonryLayout';
import { IStateDiscover } from '../typing/interface';
import CardDiscover from './CardDiscover';
import { SharedStore } from '../store/Shared/reducer';

interface MasonryCard {
  data: IStateDiscover['mergedDataDiscover'];
  sorted: string;
  imagesDataDiscover: { mapData: Map<number, RenderImages>; arrayData: [RenderImages] | any[] };
}

const MasonryCard: React.FC<MasonryCard> = React.memo(
  ({ data, sorted, imagesDataDiscover }) => {
    const { width } = SharedStore.store().Width();
    let columnCount = 0;
    let increment = 300;
    const baseWidth = 760;
    if (width > 760) {
      while (baseWidth + increment <= width) {
        columnCount += 1;
        increment += 300;
      }
    }
    return (
      <MasonryLayout columns={columnCount}>
        {Object.keys(data).map((key, idx) => (
          <CardDiscover
            key={data[idx].id}
            columnCount={columnCount}
            imagesMapDataDiscover={imagesDataDiscover.mapData}
            githubData={data[idx]}
            index={data[idx].id}
            sorted={sorted}
          />
        ))}
      </MasonryLayout>
    );
  },
  (prev, next) => {
    return (
      prev.data.length === next.data.length &&
      prev.imagesDataDiscover === next.imagesDataDiscover &&
      prev.sorted === next.sorted
    );
  }
);
MasonryCard.displayName = 'MasonryCard';
export default MasonryCard;
