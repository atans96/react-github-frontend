import { MergedDataProps } from '../typing/type';
import React, { useRef } from 'react';
import { Masonry } from '../util/masonic/masonry';
import Card from './Card';

interface MasonryCard {
  getRootProps: any;
  data: MergedDataProps[];
}
const MasonryCard = React.memo<MasonryCard>(
  ({ data, getRootProps }) => {
    const length = useRef<number>(0);
    let key = 0;
    if (data.length < length.current) {
      key = 1;
    }
    length.current = data.length; //TODO: pass this to Card (see CardDiscover)
    return (
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
    );
  },
  (prevProps: any, nextProps: any) => {
    return prevProps.data.length === nextProps.data.length; // when the component receives updated data from state such as load more, or clicked to login to access graphql
    // it needs to get re-render to get new data.
  }
);
MasonryCard.displayName = 'MasonryCard';
export default MasonryCard;
