import { MergedDataProps } from '../typing/type';
import React, { useRef } from 'react';
import { Masonry } from '../util/masonic/masonry';
import Card from './Card';

interface MasonryMemo {
  getRootProps: any;
  data: MergedDataProps[];
}

const MasonryMemo: React.FC<MasonryMemo> = ({ data, getRootProps }) => {
  const length = useRef<number>(0);
  let key = 0;
  if (data.length < length.current) {
    key = 1;
  }
  length.current = data.length;
  return React.useMemo(
    () => (
      <div className={'masonic'}>
        <Masonry
          key={key}
          items={data}
          args={{ getRootProps }}
          columnGutter={10}
          columnWidth={370}
          overscanBy={10}
          render={Card}
        />
      </div>
    ),
    [data.length]
  );
};
MasonryMemo.displayName = 'MasonryMemo';
export default MasonryMemo;
