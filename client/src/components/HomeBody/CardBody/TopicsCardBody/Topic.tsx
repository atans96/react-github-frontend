import React from 'react';
import './TopicStyle.scss';
import { createStore } from '../../../../util/hooksy';

interface Topic {
  topic: string;
  getRootProps: any;
  idx: number;
}
const defaultMousePosition = { x: 0, y: 0 };
export const [useMouseSpawn] = createStore(defaultMousePosition);
const Topic: React.FC<Topic> = ({ idx, topic, getRootProps }) => {
  const [, setMouse] = useMouseSpawn();
  const ref = React.useRef('400px');
  const handleClickTopic = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (e.pageX + parseInt(ref.current) > window.innerWidth) {
      setMouse({
        x: window.innerWidth - parseInt(ref.current) - 200,
        y: e.pageY,
      });
    } else {
      setMouse({ x: e.pageX, y: e.pageY });
    }
    // e.stopPropagation(); //if you do this, onClickCb at Home.tsx won't execute
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
