import DbCtx from '../db/db.ctx';
import { useApolloClient } from '@apollo/client';
import { GET_SEEN } from '../graphql/queries';
import { SeenProps } from '../typing/type';
import { parallel } from 'async';
import { useTrackedState, useTrackedStateShared } from '../selectors/stateContextSelector';
import uniqBy from 'lodash.uniqby';

export const useGetSeenMutation = () => {
  const { db } = DbCtx.useContainer();
  const client = useApolloClient();
  const [, dispatchShared] = useTrackedStateShared();
  const [, dispatch] = useTrackedState();

  return function (data: SeenProps[]) {
    db?.getSeen.get(1).then((oldData: any) => {
      if (oldData?.data) {
        const old = JSON.parse(oldData.data);
        if (old?.getSeen && old?.getSeen?.seenCards && old?.getSeen?.seenCards.length > 0) {
          parallel([
            () =>
              dispatchShared({
                type: 'SET_SEEN',
                payload: {
                  seenCards: uniqBy([...data, ...old?.getSeen?.seenCards], 'id'),
                },
              }),
            () =>
              dispatch({
                type: 'UNDISPLAY_MERGED_DATA',
                payload: {
                  undisplayMergedData: uniqBy([...data, ...old?.getSeen?.seenCards], 'id'),
                },
              }),
            () =>
              client.cache.writeQuery({
                query: GET_SEEN,
                data: {
                  getSeen: {
                    seenCards: uniqBy([...data, ...old?.getSeen?.seenCards], 'id'),
                  },
                },
              }),
            () =>
              db?.getSeen?.update(1, {
                data: JSON.stringify({
                  getSeen: {
                    seenCards: uniqBy([...data, ...old?.getSeen?.seenCards], 'id'),
                  },
                }),
              }),
          ]);
        } else {
          parallel([
            () =>
              dispatchShared({
                type: 'SET_SEEN',
                payload: {
                  seenCards: data,
                },
              }),
            () =>
              dispatch({
                type: 'UNDISPLAY_MERGED_DATA',
                payload: {
                  undisplayMergedData: data,
                },
              }),
            () =>
              client.cache.writeQuery({
                query: GET_SEEN,
                data: {
                  getSeen: {
                    seenCards: data,
                  },
                },
              }),
            () =>
              db?.getSeen?.add(
                {
                  data: JSON.stringify({
                    getSeen: {
                      seenCards: data,
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
            dispatchShared({
              type: 'SET_SEEN',
              payload: {
                seenCards: data,
              },
            }),
          () =>
            dispatch({
              type: 'UNDISPLAY_MERGED_DATA',
              payload: {
                undisplayMergedData: data,
              },
            }),
          () =>
            client.cache.writeQuery({
              query: GET_SEEN,
              data: {
                getSeen: {
                  seenCards: data,
                },
              },
            }),
          () =>
            db?.getSeen?.add(
              {
                data: JSON.stringify({
                  getSeen: {
                    seenCards: data,
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
