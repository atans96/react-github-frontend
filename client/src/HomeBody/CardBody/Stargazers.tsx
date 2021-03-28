import React, { useCallback } from 'react';
import StargazersCard from './StargazersCard';
import { MergedDataProps } from '../../typing/type';
import { IAction, IState, IStateShared, IStateStargazers } from '../../typing/interface';
import { useApolloClient } from '@apollo/client';
import { useEventHandlerComposer } from '../../hooks/hooks';
import { Action } from '../../store/Home/reducer';
import { ActionStargazers } from '../../store/Staargazers/reducer';
import { ActionShared } from '../../store/Shared/reducer';

interface StargazersProps {
  data: MergedDataProps;
  stateStargazers: { state: IState; stateStargazers: IStateStargazers; stateShared: IStateShared };
  dispatch: React.Dispatch<IAction<Action>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
  dispatchStargazersUser: React.Dispatch<IAction<ActionStargazers>>;
  githubDataId: number;
  githubDataFullName: string;
}

const Stargazers: React.FC<StargazersProps> = ({
  githubDataFullName,
  githubDataId,
  dispatch,
  dispatchStargazersUser,
  dispatchShared,
  data,
  stateStargazers,
}) => {
  const stargazerCountMemoized = useCallback(() => {
    return data.stargazers_count;
  }, [data.stargazers_count]);
  const client = useApolloClient();
  const GQL_variables = {
    reponame: data.name,
    owner: data.owner.login,
    stargazersCount: stateStargazers.stateStargazers || 2,
    starredRepoCount: stateStargazers.stateStargazers.stargazersUsersStarredRepositories || 2,
  };

  const GQL_pagination_variables = {
    reponame: data.name,
    owner: data.owner.login,
    stargazersCount: stateStargazers.stateStargazers || 2, // localStorage.getItem("users) cannot be updated to stargazersCount
    // when localStorage changes as a result of FilterResult of localStorage.setItem()
    // but to update this stargazersCount variable, StargazersCard component need to re-render
    // but there is no way to re-render StargazersCard as a result of FilterResult changes other than
    // clicks event in StargazersCard.js. Thus, you need to use React.context to sync with FilterResult.js
    starredRepoCount: stateStargazers.stateStargazers.stargazersUsersStarredRepositories || 2,
    after: stateStargazers.stateStargazers.hasNextPage.endCursor,
  };
  const onClickCb = useCallback(
    async ({ query, variables }) => {
      if (stateStargazers.stateShared.tokenGQL !== '') {
        return await client // return Promise
          .query({
            query: query,
            variables: variables,
            context: { clientName: 'github' },
          })
          .then((result) => {
            result.data.repository.stargazers.nodes.map((node: any) => {
              const newNode = { ...node };
              newNode['isQueue'] = false;
              return dispatchStargazersUser({
                type: 'STARGAZERS_ADDED',
                payload: {
                  stargazersData: newNode,
                },
              });
            });
            dispatchStargazersUser({
              type: 'STARGAZERS_HAS_NEXT_PAGE',
              payload: {
                hasNextPage: result.data.repository.stargazers.pageInfo,
              },
            });
          });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stateStargazers.stateShared.tokenGQL] // if not specified, tokenGQL !== '' will always true when you click it again, even though tokenGQL already updated
  );
  const { getRootProps } = useEventHandlerComposer({ onClickCb: onClickCb });
  return (
    <StargazersCard
      stargazerCount={stargazerCountMemoized()}
      githubDataFullName={githubDataFullName}
      githubDataId={githubDataId}
      dispatchShared={dispatchShared}
      dispatch={dispatch}
      getRootProps={getRootProps}
      dispatchStargazersUser={dispatchStargazersUser}
      stateStargazers={stateStargazers}
      GQL_VARIABLES={{
        GQL_variables,
        GQL_pagination_variables,
      }}
    />
  );
};

Stargazers.displayName = 'Stargazers';
export default Stargazers;
