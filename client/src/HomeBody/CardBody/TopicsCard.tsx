import React from 'react';
import Topic from './TopicsCardBody/Topic';
import { createRenderElement } from '../../Layout/MasonryLayout';

interface TopicsCard {
  data: string[];
  getRootProps: any;
}

const TopicsCard: React.FC<TopicsCard> = ({ data, getRootProps }) => {
  return (
    <ul className="topic space-center">
      {data?.map((topic, idx) => createRenderElement(Topic, { key: idx, idx, topic, getRootProps }))}
    </ul>
  );
};
TopicsCard.displayName = 'TopicsCard';
export default TopicsCard;
