import { useApolloClient } from '@apollo/client';
import { GET_USER_DATA } from '../graphql/queries';
import { GraphQLUserData } from '../typing/interface';
import { Pick2 } from '../typing/type';
import { parallel } from 'async';
import DbCtx from '../db/db.ctx';

export const useGetUserDataMutation = () => {
  const client = useApolloClient();
  const { db } = DbCtx.useContainer();
  return async function (data: Pick2<GraphQLUserData, 'getUserData', 'languagePreference'>) {
    db?.getUserData.get(1).then((oldData: any) => {
      if (oldData?.data) {
        const old: GraphQLUserData = JSON.parse(oldData.data);
        if (old?.getUserData?.languagePreference?.length > 0) {
          parallel([
            () =>
              client.cache.writeQuery({
                query: GET_USER_DATA,
                data: {
                  getUserData: {
                    ...old.getUserData,
                    languagePreference: [...data.getUserData.languagePreference],
                  },
                },
              }),
            () =>
              db?.getUserData?.update(1, {
                data: JSON.stringify({
                  getUserData: {
                    ...old.getUserData,
                    languagePreference: [...data.getUserData.languagePreference],
                  },
                }),
              }),
          ]);
        }
      }
    });
  };
};
