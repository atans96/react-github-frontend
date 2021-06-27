import React from 'react';
import trieMemoize from 'trie-memoize';
import OneKeyMap from '@essentials/one-key-map';

interface MasonryLayout {
  children: any;
  columns: number;
  style?: React.CSSProperties;
  gap?: number | null;
}
export const createRenderElement = trieMemoize([OneKeyMap, WeakMap], (RenderComponent, args) => (
  <RenderComponent {...args} />
));
const MasonryLayout = (props: MasonryLayout) => {
  const columnWrapper: any = {};
  const result = [];

  // create columns
  for (let i = 0; i < props.columns; i++) {
    columnWrapper[`column${i}`] = [];
  }

  // divide children into columns
  for (let i = 0; i < props.children.length; i++) {
    const columnIndex = i % props.columns;
    columnWrapper[`column${columnIndex}`].push(
      <div key={i} style={{ marginBottom: `${props.gap ? props.gap : 10}px` }}>
        {props.children[i]}
      </div>
    );
  }

  // wrap children in each column with a div
  for (let i = 0; i < props.columns; i++) {
    result.push(
      <div key={i} className="masonry-column">
        {columnWrapper[`column${i}`]}
      </div>
    );
  }

  return <div className={'masonry-parent-container'}>{result}</div>;
};
export default MasonryLayout;
