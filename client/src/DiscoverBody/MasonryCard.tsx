import { RenderImages } from '../typing/type';
import React from 'react';
import MasonryLayout, { createRenderElement } from '../Layout/MasonryLayout';
import { IStateDiscover } from '../typing/interface';
import { useTrackedStateDiscover, useTrackedStateShared } from '../selectors/stateContextSelector';
import CardDiscover from './CardDiscover';

interface MasonryLayoutMemo {
  data: IStateDiscover['mergedDataDiscover'];
  sorted: string;
  imagesDataDiscover: { mapData: Map<number, RenderImages>; arrayData: [RenderImages] | any[] };
}

const MasonryLayoutMemo: React.FC<MasonryLayoutMemo> = ({ data, sorted, imagesDataDiscover }) => {
  const [stateShared] = useTrackedStateShared();
  const [stateDiscover] = useTrackedStateDiscover();
  let columnCount = 0;
  let increment = 300;
  const baseWidth = 760;
  if (stateShared.width > 760) {
    while (baseWidth + increment <= stateShared.width) {
      columnCount += 1;
      increment += 300;
    }
  }
  return React.useMemo(
    () => (
      <MasonryLayout columns={columnCount}>
        {Object.keys(data).map((key, idx) =>
          createRenderElement(CardDiscover, {
            key: data[idx].id,
            columnCount,
            imagesMapDataDiscover: imagesDataDiscover.mapData,
            index: data[idx].id,
            githubData: data[idx],
          })
        )}
      </MasonryLayout>
    ),
    [data.length, imagesDataDiscover, stateDiscover.mergedDataDiscover, stateShared.width, sorted]
  );
};
MasonryLayoutMemo.displayName = 'MasonryLayoutMemo';
export default MasonryLayoutMemo;
