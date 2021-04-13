import React from 'react';
import Topic from './TopicsCardBody/Topic';
import { isEqualObjects } from '../../util';
import { createRenderElement } from '../../Layout/MasonryLayout';

interface TopicsCard {
  data: string[];
  getRootProps: any;
}

const TopicsCard = React.memo<TopicsCard>(
  ({ data, getRootProps }) => {
    return (
      <ul className="topic space-center">
        {data?.map((topic, idx) => createRenderElement(Topic, { key: idx, idx, topic, getRootProps }))}
      </ul>
    );
  },
  (prevProps: any, nextProps: any) => {
    // because tokenGQL is updating when the user login, it will update tokenGQL, which will be used
    // by getRootProps to re-declare since it's using tokenGQL as its dependency, so you need to
    // include to dependency array for this TopicCard to re-declare getRootProps with updated tokenGQL
    // otherwise it will use stale state in the callback
    return isEqualObjects(prevProps.data, nextProps.data);
  }
);
TopicsCard.displayName = 'TopicsCard';
export default TopicsCard;
