import React, { useCallback } from 'react';
import StargazersCard from './StargazersCard';
import { MergedDataProps } from '../../typing/type';
import { isEqualObjects } from '../../util';
import { IState, IStateStargazers } from '../../typing/interface';
import { useApolloClient } from '@apollo/client';
import { dispatchStargazersHasNextPage, dispatchStargazersInfo } from '../../store/dispatcher';
import { useEventHandlerComposer } from '../../hooks/hooks';

interface StargazersProps {
  data: MergedDataProps;
  state: IState;
  stateStargazers: IStateStargazers;
  dispatch: any;
  dispatchStargazersUser: any;
  dataMongoMemoize: any;
  githubDataId: number;
  githubDataFullName: string;
}

const Stargazers = React.memo<StargazersProps>(
  ({
    githubDataFullName,
    githubDataId,
    dataMongoMemoize,
    dispatch,
    dispatchStargazersUser,
    state,
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
      stargazersCount: stateStargazers.stargazersUsers || 2,
      starredRepoCount: stateStargazers.stargazersUsersStarredRepositories || 2,
    };

    const GQL_pagination_variables = {
      reponame: data.name,
      owner: data.owner.login,
      stargazersCount: stateStargazers.stargazersUsers || 2, // localStorage.getItem("users) cannot be updated to stargazersCount
      // when localStorage changes as a result of FilterResult of localStorage.setItem()
      // but to update this stargazersCount variable, StargazersCard component need to re-render
      // but there is no way to re-render StargazersCard as a result of FilterResult changes other than
      // clicks event in StargazersCard.js. Thus, you need to use React.context to sync with FilterResult.js
      starredRepoCount: stateStargazers.stargazersUsersStarredRepositories || 2,
      after: stateStargazers.hasNextPage.endCursor,
    };
    const onClickCb = useCallback(
      async ({ query, variables }) => {
        if (state.tokenGQL !== '') {
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
                return dispatchStargazersInfo(newNode, dispatchStargazersUser);
              });
              dispatchStargazersHasNextPage(result.data.repository.stargazers.pageInfo, dispatchStargazersUser);
            });
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [state.tokenGQL] // if not specified, tokenGQL !== '' will always true when you click it again, even though tokenGQL already updated
    );
    const { getRootProps } = useEventHandlerComposer({ onClickCb: onClickCb });
    return (
      <StargazersCard
        stargazerCount={stargazerCountMemoized()}
        state={state}
        githubDataFullName={githubDataFullName}
        githubDataId={githubDataId}
        dataMongoMemoize={dataMongoMemoize}
        dispatch={dispatch}
        getRootProps={getRootProps}
        dispatchStargazers={dispatchStargazersUser}
        stateStargazers={stateStargazers}
        GQL_VARIABLES={{
          GQL_variables,
          GQL_pagination_variables,
        }}
      />
    );
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.data, nextProps.data) &&
      isEqualObjects(prevProps.state.tokenGQL, nextProps.state.tokenGQL) &&
      isEqualObjects(prevProps.state.isLoggedIn, nextProps.state.isLoggedIn)
    );
  }
);
Stargazers.displayName = 'Stargazers';
export default Stargazers;
