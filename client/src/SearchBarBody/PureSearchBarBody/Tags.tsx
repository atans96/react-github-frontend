import React from 'react';
import { TopicsProps } from '../../typing/type';
import { HomeStore } from '../../store/Home/reducer';

interface TagsProps {
  obj: TopicsProps;
  clicked: boolean;
}

export const Tags: React.FC<TagsProps> = ({ obj, clicked }) => {
  const index = HomeStore.store()
    .Topics()
    .topics.findIndex((x) => x.topic === obj.topic);
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    HomeStore.store().Topics().topics[index].clicked = !HomeStore.store().Topics().topics[index].clicked;
    const isClicked = HomeStore.store().Topics().topics[index].clicked;
    if (HomeStore.store().FilteredTopics().filteredTopics.length === 0 || isClicked) {
      HomeStore.dispatch({
        type: 'FILTER_SET_TOPICS', // execute spawnTopicTags at PureSearchBar.tsx, then it will show the color actived
        // then execute MERGED_DATA_FILTER_BY_TAGS at PureSearchBar.tsx, then re-render Cards at Home.tsx
        // since parent given higher priority to re-render, then spawnTopicTags at PureSearchbar.tsx, rerender Tags.tsx, then
        // execute state.filteredMergedData useEffect to render new topics according to filteredMergedData
        payload: {
          filteredTopics: obj.topic,
        },
      });
      HomeStore.dispatch({
        type: 'FILTER_SET_TOPICS',
        payload: {
          filteredTopics: obj.topic,
        },
      });
    } else {
      HomeStore.dispatch({
        type: 'FILTER_SET_TOPICS_REMOVE',
        payload: {
          filteredTopics: obj.topic,
        },
      });
    }
  };

  return (
    <button onClick={handleClick} className={clicked ? 'active' : ''}>
      {obj.topic} <span className={clicked ? 'active' : ''}>{obj.count}</span>
    </button>
  );
};
Tags.displayName = 'Tags';
