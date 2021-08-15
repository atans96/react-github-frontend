import { useApolloClient } from '@apollo/client';
import { GET_CLICKED } from '../graphql/queries';
import { GraphQLClickedData } from '../typing/interface';
import { parallel } from 'async';
import DbCtx from '../db/db.ctx';

export const useGetClickedMutation = () => {
  const client = useApolloClient();
  const { db } = DbCtx.useContainer();
  return async function (data: GraphQLClickedData) {
    db.getClicked.get(1).then((oldData: any) => {
      if (oldData?.data) {
        const old: GraphQLClickedData = JSON.parse(oldData.data);
        if (old?.getClicked?.clicked && old?.getClicked?.clicked?.length > 0) {
          parallel([
            () =>
              client.cache.writeQuery({
                query: GET_CLICKED,
                data: {
                  getClicked: {
                    clicked: [...data.getClicked.clicked, ...old?.getClicked?.clicked],
                  },
                },
              }),
            () =>
              db?.getClicked?.update(1, {
                data: JSON.stringify({
                  getClicked: {
                    clicked: [...data.getClicked.clicked, ...old?.getClicked?.clicked],
                  },
                }),
              }),
          ]);
        } else {
          parallel([
            () =>
              client.cache.writeQuery({
                query: GET_CLICKED,
                data: {
                  getClicked: {
                    clicked: data.getClicked.clicked,
                  },
                },
              }),
            () =>
              db?.getClicked?.add(
                {
                  data: JSON.stringify({
                    getClicked: {
                      clicked: data.getClicked.clicked,
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
              query: GET_CLICKED,
              data: {
                getClicked: {
                  clicked: data.getClicked.clicked,
                },
              },
            }),
          () =>
            db?.getClicked?.add(
              {
                data: JSON.stringify({
                  getClicked: {
                    clicked: data.getClicked.clicked,
                  },
                }),
              },
              1
            ),
        ]);
      }
    });
  };
};
