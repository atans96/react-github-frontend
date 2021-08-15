import React from 'react';
import { StargazerProps } from '../../../typing/type';
import { CrossIcon } from '../../../util/icons';
import { useTrackedStateStargazers } from '../../../selectors/stateContextSelector';

interface SearchBarProps {
  stargazer: StargazerProps;
}

// separate setState from SearchBar so that SearchBar won't get rerender by onChange
const MultiValueSearch: React.FC<SearchBarProps> = ({ stargazer }) => {
  const [stateStargazers, dispatchStargazers] = useTrackedStateStargazers();
  const handleClickDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updatedStargazersData = stateStargazers.stargazersData.find((obj: StargazerProps) => obj.id === stargazer.id);
    if (updatedStargazersData !== undefined) {
      try {
        updatedStargazersData.isQueue = !updatedStargazersData.isQueue;
      } catch {
        updatedStargazersData['isQueue'] = false;
      }
      dispatchStargazers({
        type: 'STARGAZERS_UPDATED',
        payload: {
          stargazersData: stateStargazers.stargazersData.map((obj: StargazerProps) => {
            if (obj.id === updatedStargazersData.id) {
              return updatedStargazersData;
            } else {
              return obj;
            }
          }),
        },
      });
      dispatchStargazers({
        type: 'SET_QUEUE_STARGAZERS',
        payload: {
          stargazersQueueData: stargazer,
        },
      });
    } else {
      stargazer.isQueue = false;
      dispatchStargazers({
        type: 'STARGAZERS_ADDED_WITHOUT_FILTER',
        payload: {
          stargazersData: stargazer,
        },
      });
      dispatchStargazers({
        type: 'SET_QUEUE_STARGAZERS',
        payload: {
          stargazersQueueData: stargazer,
        },
      });
    }
  };
  return (
    <div className={'input-bar-container-control-searchbar-multivalue'}>
      <div className={'multivalue'}>{stargazer.login}</div>
      <div className={'multivalue-cross'} onClick={handleClickDelete}>
        <CrossIcon />
      </div>
    </div>
  );
};
MultiValueSearch.displayName = 'MultiValueSearch';
export default MultiValueSearch;
