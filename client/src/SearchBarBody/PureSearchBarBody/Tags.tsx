import React from 'react';
import { IState } from '../../typing/interface';

interface TagsProps {
  obj: any;
  clicked: boolean;
  state: IState;
  dispatch: any;
}

export const Tags: React.FC<TagsProps> = ({ obj, clicked, state, dispatch }) => {
  const index = state.topics.findIndex((x) => x.topic === obj.topic);
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    state.topics[index].clicked = !state.topics[index].clicked;
    const isClicked = state.topics[index].clicked;
    if (state.filteredTopics.length === 0) {
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
      if (isClicked) {
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
          type: 'FILTER_SET_TOPICS_REMOVE', // execute spawnTopicTags at PureSearchBar.tsx, then it will show the color actived
          // then execute MERGED_DATA_FILTER_BY_TAGS at PureSearchBar.tsx, then re-render Cards at Home.tsx
          // since parent given higher priority to re-render, then spawnTopicTags at PureSearchbar.tsx, rerender Tags.tsx, then
          // execute state.filteredMergedData useEffect to render new topics according to filteredMergedData
          payload: {
            filteredTopics: obj.topic,
          },
        });
      }
    }
  };

  return (
    <button onClick={handleClick} className={clicked ? 'active' : ''}>
      {obj.topic} <span className={clicked ? 'active' : ''}>{obj.count}</span>
    </button>
  );
};
Tags.displayName = 'Tags';
