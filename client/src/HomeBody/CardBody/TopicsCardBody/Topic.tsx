import React from 'react';
import './TopicStyle.scss';

interface Topic {
  topic: string;
  idx: number;
  getRootProps: any;
}

const Topic: React.FC<Topic> = ({ idx, topic, getRootProps }) => {
  const handleClickTopic = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
  };
  return (
    <button className={'tag'}>
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
        key={idx}
      >
        {topic.trim()}
      </h6>
    </button>
  );
};
export default Topic;
