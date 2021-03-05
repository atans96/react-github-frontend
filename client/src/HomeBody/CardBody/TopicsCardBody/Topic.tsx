import React from 'react';
import styled from 'styled-components';
import { Button, TopicText } from './TopicStyle';

interface Topic {
  topic: string;
  idx: number;
  getRootProps: any;
}
const Tag = styled(Button)`
  display: inline-block;
  font-size: 13px;
  border-radius: 12px;
  padding: 4px 8px;
  margin-right: 10px;
  margin-bottom: 5px;
  text-align: center;
`;
const Topic: React.FC<Topic> = ({ idx, topic, getRootProps }) => {
  const handleClickTopic = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
  };
  return (
    <Tag>
      <TopicText
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
      </TopicText>
    </Tag>
  );
};
export default Topic;
