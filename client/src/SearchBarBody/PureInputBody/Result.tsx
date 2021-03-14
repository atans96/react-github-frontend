import React from 'react';
import { IStateStargazers } from '../../typing/interface';
import { StargazerProps } from '../../typing/type';
import { CrossIcon } from '../../util/icons';

interface SearchBarProps {
  stargazer: any;
  stateStargazers: IStateStargazers;
  dispatchStargazersUser: any;
}

// separate setState from SearchBar so that SearchBar won't get rerender by onChange
export const Result: React.FC<SearchBarProps> = React.forwardRef(
  ({ stateStargazers, stargazer, dispatchStargazersUser }, ref) => {
    const handleClickDelete = (e: React.MouseEvent) => {
      e.preventDefault();
      const updatedStargazersData = stateStargazers.stargazersData.find(
        (obj: StargazerProps) => obj.id === stargazer.id
      );
      if (updatedStargazersData !== undefined) {
        try {
          updatedStargazersData.isQueue = !updatedStargazersData.isQueue;
        } catch {
          updatedStargazersData['isQueue'] = false;
        }
        dispatchStargazersUser({
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
        dispatchStargazersUser({
          type: 'SET_QUEUE_STARGAZERS',
          payload: {
            stargazersQueueData: stargazer,
          },
        });
      } else {
        stargazer.isQueue = false;
        dispatchStargazersUser({
          type: 'STARGAZERS_ADDED_WITHOUT_FILTER',
          payload: {
            stargazersData: stargazer,
          },
        });
        dispatchStargazersUser({
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
  }
);
Result.displayName = 'Result';
