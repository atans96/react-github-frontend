import DbCtx from '../db/db.ctx';
import { GraphQLSearchesData } from '../typing/interface';
import { createStore } from '../util/hooksy';
import { useApolloClient } from '@apollo/client';
import { GET_SEARCHES } from '../graphql/queries';
import { map, parallel } from 'async';
import { Searches } from '../typing/type';

const defaultSearchesData: GraphQLSearchesData | any = {};
export const [useSearchesDataDexie] = createStore(defaultSearchesData);

export const useGetSearchesMutation = () => {
  const { db } = DbCtx.useContainer();
  const client = useApolloClient();

  return function (data: GraphQLSearchesData) {
    db?.transaction('rw', [db?.getSearches], () => {
      db?.getSearches.get(1).then((oldData: any) => {
        if (oldData?.data) {
          let needAppend = true;
          map(
            [...JSON.parse(oldData.data).getSearches.searches],
            (obj: Searches, cb) => {
              if (obj.search === data.getSearches.searches[0].search) {
                needAppend = false;
                const temp = Object.assign(
                  {},
                  {
                    search: obj.search,
                    count: obj.count + 1,
                    updatedAt: new Date(),
                  }
                );
                cb(null, temp);
                return temp;
              }
              cb(null, obj);
              return obj;
            },
            (err, res) => {
              if (err) {
                throw new Error('Err');
              }
              parallel([
                () =>
                  client.cache.writeQuery({
                    query: GET_SEARCHES,
                    data: {
                      getSearches: {
                        searches: needAppend ? [...data.getSearches.searches, ...res] : res,
                      },
                    },
                  }),
                () =>
                  db?.getSearches?.update(1, {
                    data: JSON.stringify({
                      getSearches: {
                        searches: needAppend ? [...data.getSearches.searches, ...res] : res,
                      },
                    }),
                  }),
              ]);
            }
          );
        } else {
          parallel([
            () =>
              client.cache.writeQuery({
                query: GET_SEARCHES,
                data: {
                  getSearches: {
                    searches: [...data.getSearches.searches],
                  },
                },
              }),
            () =>
              db?.getSearches?.add(
                {
                  data: JSON.stringify({
                    getSearches: {
                      searches: [...data.getSearches.searches],
                    },
                  }),
                },
                1
              ),
          ]);
        }
      });
    });
  };
};
