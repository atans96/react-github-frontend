import React from 'react';
import Topic from './TopicsCardBody/Topic';

interface TopicsCard {
  data: string[];
  getRootProps: any;
}

const TopicsCard: React.FC<TopicsCard> = ({ data, getRootProps }) => {
  return (
    <ul className="topic space-center">
      {data?.map((topic, idx) => (
        <Topic key={idx} topic={topic} getRootProps={getRootProps} idx={idx} />
      ))}
    </ul>
  );
};
TopicsCard.displayName = 'TopicsCard';
export default TopicsCard;
