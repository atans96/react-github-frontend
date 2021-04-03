import React from 'react';
import Topic from './TopicsCardBody/Topic';
import { isEqualObjects } from '../../util';

interface TopicsCard {
  data: string[];
  getRootProps: any;
}

const TopicsCard = React.memo<TopicsCard>(
  ({ data, getRootProps }) => {
    return (
      <ul className="masonry space-center">
        {data?.map((topic, idx) => (
          <Topic key={idx} idx={idx} topic={topic} getRootProps={getRootProps} />
        ))}
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
