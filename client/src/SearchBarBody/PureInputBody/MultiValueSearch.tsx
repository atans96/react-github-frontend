import React from 'react';
import { StargazerProps } from '../../typing/type';
import { CrossIcon } from '../../util/icons';
import { StargazersStore } from '../../store/Staargazers/reducer';

interface SearchBarProps {
  stargazer: StargazerProps;
}

// separate setState from SearchBar so that SearchBar won't get rerender by onChange
const MultiValueSearch: React.FC<SearchBarProps> = ({ stargazer }) => {
  const handleClickDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    const updatedStargazersData = StargazersStore.store()
      .StargazersData()
      .stargazersData.find((obj: StargazerProps) => obj.id === stargazer.id);
    if (updatedStargazersData !== undefined) {
      try {
        updatedStargazersData.isQueue = !updatedStargazersData.isQueue;
      } catch {
        updatedStargazersData['isQueue'] = false;
      }
      StargazersStore.dispatch({
        type: 'STARGAZERS_UPDATED',
        payload: {
          stargazersData: StargazersStore.store()
            .StargazersData()
            .stargazersData.map((obj: StargazerProps) => {
              if (obj.id === updatedStargazersData.id) {
                return updatedStargazersData;
              } else {
                return obj;
              }
            }),
        },
      });
      StargazersStore.dispatch({
        type: 'SET_QUEUE_STARGAZERS',
        payload: {
          stargazersQueueData: stargazer,
        },
      });
    } else {
      stargazer.isQueue = false;
      StargazersStore.dispatch({
        type: 'STARGAZERS_ADDED_WITHOUT_FILTER',
        payload: {
          stargazersData: stargazer,
        },
      });
      StargazersStore.dispatch({
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
