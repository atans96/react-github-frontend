import React, { useCallback, useContext } from 'react';
import StargazersCard from './StargazersCard';
import { MergedDataProps } from '../../typing/type';
import { isEqualObjects } from '../../util';
import { IState } from '../../typing/interface';
import { ContextStargazers } from '../../index';
import { useApolloClient } from '@apollo/client';
import { dispatchStargazersHasNextPage, dispatchStargazersInfo } from '../../store/dispatcher';
import { useEventHandlerComposer } from '../../hooks/hooks';

interface StargazersProps {
  data: MergedDataProps;
  state: IState;
  dispatch: any;
  dataMongoMemoize: any;
  githubDataId: number;
  githubDataFullName: string;
}

const Stargazers = React.memo<StargazersProps>(
  ({ githubDataFullName, githubDataId, dataMongoMemoize, dispatch, state, data }) => {
    const { stateStargazers, dispatchStargazers } = useContext(ContextStargazers); // the reason we don't pass ContextStargazers from Home.tsx to Stargazers.tsx
    // is to prevent other Card children to re-render despite them not consuming ContextStargazers.
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
                return dispatchStargazersInfo(newNode, dispatchStargazers);
              });
              dispatchStargazersHasNextPage(result.data.repository.stargazers.pageInfo, dispatchStargazers);
            });
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [state.tokenGQL] // if not specified, tokenGQL !== '' will always true when you click it again, even though tokenGQL already updated
    );
    const { getRootProps } = useEventHandlerComposer({ onClickCb: onClickCb });
    const stateStargazersMemoizedData = useCallback(() => {
      return stateStargazers;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateStargazers]);
    return (
      <StargazersCard
        stargazerCount={stargazerCountMemoized()}
        state={state}
        githubDataFullName={githubDataFullName}
        githubDataId={githubDataId}
        dataMongoMemoize={dataMongoMemoize}
        dispatch={dispatch}
        getRootProps={getRootProps}
        dispatchStargazers={dispatchStargazers}
        stateStargazers={stateStargazersMemoizedData()}
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
export default Stargazers;
