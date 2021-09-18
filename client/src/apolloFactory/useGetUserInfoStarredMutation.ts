import DbCtx, { useDexieDB } from '../db/db.ctx';
import { useTrackedStateShared } from '../selectors/stateContextSelector';
import { useApolloClient } from '@apollo/client';
import { GET_USER_STARRED } from '../graphql/queries';
import { parallel } from 'async';
import { GraphQLUserStarred } from '../typing/interface';
import uniqBy from 'lodash.uniqby';

export const useGetUserInfoStarredMutation = () => {
  // const { db } = DbCtx.useContainer();
  const [db, setDb] = useDexieDB();
  const [, dispatchShared] = useTrackedStateShared();
  const client = useApolloClient();
  const oldExistAndProperty = (data: GraphQLUserStarred, old: GraphQLUserStarred) => {
    return parallel([
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
  };
  const oldExistAndNoProperty = (data: Array<{ is_queried: boolean; full_name: string }>, old: GraphQLUserStarred) => {
    return parallel([
      () =>
        dispatchShared({
          type: 'SET_STARRED',
          payload: {
            starred: uniqBy([...data, ...old.getUserInfoStarred.starred], 'full_name'),
          },
        }),
      () =>
        client.cache.writeQuery({
          query: GET_USER_STARRED,
          data: {
            getUserInfoStarred: {
              starred: uniqBy([...data, ...old.getUserInfoStarred.starred], 'full_name'),
            },
          },
        }),
      () =>
        db?.getUserInfoStarred?.update(1, {
          data: JSON.stringify({
            getUserInfoStarred: {
              starred: uniqBy([...data, ...old.getUserInfoStarred.starred], 'full_name'),
            },
          }),
        }),
    ]);
  };
  const oldNotExistAndProperty = (data: GraphQLUserStarred) => {
    return parallel([
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
  };
  const oldNotExistAndNoProperty = (data: Array<{ is_queried: boolean; full_name: string }>) => {
    return parallel([
      () =>
        client.cache.writeQuery({
          query: GET_USER_STARRED,
          data: {
            getUserInfoStarred: {
              starred: data,
            },
          },
        }),
      () =>
        db?.getUserInfoStarred?.add(
          {
            data: JSON.stringify({
              getUserInfoStarred: {
                starred: data,
              },
            }),
          },
          1
        ),
    ]);
  };
  const removeStarred = async (data: { removeStarred: number }) => {
    db?.getUserInfoStarred.get(1).then((oldData: any) => {
      if (oldData?.data) {
        const old: GraphQLUserStarred = JSON.parse(oldData.data);
        if (old?.getUserInfoStarred?.starred?.length > 0) {
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
  const addedStarredMe = async (data: GraphQLUserStarred | Array<{ is_queried: boolean; full_name: string }>) => {
    db?.getUserInfoStarred.get(1).then((oldData: any) => {
      if (oldData?.data) {
        const old: GraphQLUserStarred = JSON.parse(oldData.data);
        if (old?.getUserInfoStarred?.starred && old?.getUserInfoStarred?.starred?.length > 0) {
          if ('getUserInfoStarred' in data) {
            oldExistAndProperty(data, old);
          } else {
            oldExistAndNoProperty(data, old);
          }
        } else {
          if ('getUserInfoStarred' in data) {
            oldNotExistAndProperty(data);
          } else {
            oldNotExistAndNoProperty(data);
          }
        }
      } else {
        if ('getUserInfoStarred' in data) {
          oldNotExistAndProperty(data);
        } else {
          oldNotExistAndNoProperty(data);
        }
      }
    });
  };

  return {
    removeStarred,
    addedStarredMe,
  };
};
