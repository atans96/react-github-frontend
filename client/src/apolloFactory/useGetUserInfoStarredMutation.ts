import DbCtx from '../db/db.ctx';
import { useTrackedStateShared } from '../selectors/stateContextSelector';
import { useApolloClient } from '@apollo/client';
import { GET_USER_STARRED } from '../graphql/queries';
import { parallel } from 'async';
import { GraphQLUserStarred } from '../typing/interface';

export const useGetUserInfoStarredMutation = () => {
  const { db } = DbCtx.useContainer();
  const [, dispatchShared] = useTrackedStateShared();
  const client = useApolloClient();
  const removeStarred = async (data: { removeStarred: number }) => {
    db.getUserInfoStarred.get(1).then((oldData: any) => {
      if (oldData?.data) {
        const old: GraphQLUserStarred = JSON.parse(oldData.data);
        if (old.getUserInfoStarred.starred.length > 0) {
          parallel([
            () =>
              dispatchShared({
                type: 'SET_STARRED',
                payload: {
                  starred: old.getUserInfoStarred.starred.filter((old: any) => old !== data.removeStarred),
                },
              }),
            () =>
              client.cache.writeQuery({
                query: GET_USER_STARRED,
                data: {
                  getUserInfoStarred: {
                    starred: old.getUserInfoStarred.starred.filter((old: any) => old !== data.removeStarred),
                  },
                },
              }),
            () =>
              db?.getUserInfoStarred?.update(1, {
                data: JSON.stringify({
                  getUserInfoStarred: {
                    starred: old.getUserInfoStarred.starred.filter((old: any) => old !== data.removeStarred),
                  },
                }),
              }),
          ]);
        }
      }
    });
  };
  const addedStarredMe = async (data: GraphQLUserStarred) => {
    db.getUserInfoStarred.get(1).then((oldData: any) => {
      if (oldData?.data) {
        const old: GraphQLUserStarred = JSON.parse(oldData.data);
        if (old?.getUserInfoStarred?.starred && old?.getUserInfoStarred?.starred?.length > 0) {
          parallel([
            () =>
              dispatchShared({
                type: 'SET_STARRED',
                payload: {
                  starred: [...data.getUserInfoStarred.starred, ...old.getUserInfoStarred.starred],
                },
              }),
            () =>
              client.cache.writeQuery({
                query: GET_USER_STARRED,
                data: {
                  getUserInfoStarred: {
                    starred: [...data.getUserInfoStarred.starred, ...old.getUserInfoStarred.starred],
                  },
                },
              }),
            () =>
              db?.getUserInfoStarred?.update(1, {
                data: JSON.stringify({
                  getUserInfoStarred: {
                    starred: [...data.getUserInfoStarred.starred, ...old.getUserInfoStarred.starred],
                  },
                }),
              }),
          ]);
        } else {
          parallel([
            () =>
              client.cache.writeQuery({
                query: GET_USER_STARRED,
                data: {
                  getUserInfoStarred: {
                    starred: data.getUserInfoStarred.starred,
                  },
                },
              }),
            () =>
              db?.getUserInfoStarred?.add(
                {
                  data: JSON.stringify({
                    getUserInfoStarred: {
                      starred: data.getUserInfoStarred.starred,
                    },
                  }),
                },
                1
              ),
          ]);
        }
      } else {
        parallel([
          () =>
            client.cache.writeQuery({
              query: GET_USER_STARRED,
              data: {
                getUserInfoStarred: {
                  starred: data.getUserInfoStarred.starred,
                },
              },
            }),
          () =>
            db?.getUserInfoStarred?.add(
              {
                data: JSON.stringify({
                  getUserInfoStarred: {
                    starred: data.getUserInfoStarred.starred,
                  },
                }),
              },
              1
            ),
        ]);
      }
    });
  };

  return {
    removeStarred,
    addedStarredMe,
  };
};
