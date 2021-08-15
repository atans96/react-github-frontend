import React from 'react';
import { TopicsProps } from '../../../typing/type';
import { useTrackedState } from '../../../selectors/stateContextSelector';
import { detect } from 'async';

interface TagsProps {
  obj: TopicsProps;
  clicked: boolean;
}

export const Tags: React.FC<TagsProps> = ({ obj, clicked }) => {
  const [state, dispatch] = useTrackedState();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    detect(
      state.topicTags,
      (x: any, cb) => {
        if (x.topic === obj.topic) {
          cb(null, x);
          return x;
        }
      },
      (err, res) => {
        if (err) {
          throw new Error('err');
        }
        res.clicked = !res.clicked;
        if (state.filteredTopics.length === 0 || res.clicked) {
          dispatch({
            type: 'FILTER_SET_TOPICS', // execute spawnTopicTags at PureSearchBar.tsx, then it will show the color actived
            // then execute MERGED_DATA_FILTER_BY_TAGS at PureSearchBar.tsx, then re-render Cards at Home.tsx
            // since parent given higher priority to re-render, then spawnTopicTags at PureSearchbar.tsx, rerender Tags.tsx, then
            // execute state.filteredMergedData useEffect to render new topics according to filteredMergedData
            payload: {
              filteredTopics: obj.topic,
            },
          });
        } else {
          dispatch({
            type: 'FILTER_SET_TOPICS_REMOVE',
            payload: {
              filteredTopics: obj.topic,
            },
          });
        }
        dispatch({
          type: 'SET_TOPICS_TAGS',
          payload: {
            topicTags: state.topicTags,
          },
        });
      }
    );
  };

  return (
    <button onClick={handleClick} className={clicked ? 'active' : ''}>
      {obj.topic} <span className={clicked ? 'active' : ''}>{obj.count}</span>
    </button>
  );
};
Tags.displayName = 'Tags';
