import React from 'react';
import './TopicStyle.scss';

interface Topic {
  topic: string;
  getRootProps: any;
  idx: number;
}

const Topic: React.FC<Topic> = ({ idx, topic, getRootProps }) => {
  const handleClickTopic = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  return (
    <button className={'tag'} key={idx}>
      <h6
        className={'topic-text'}
        {...getRootProps({
          onClick: handleClickTopic,
          params: {
            variables: {
              queryTopic: `topic:${topic}`,
            },
          },
        })}
      >
        {topic.trim()}
      </h6>
    </button>
  );
};
export default Topic;
