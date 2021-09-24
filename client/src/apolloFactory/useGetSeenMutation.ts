import { useDexieDB } from '../db/db.ctx';
import { SeenProps } from '../typing/type';
import { parallel } from 'async';
import { useTrackedState, useTrackedStateShared } from '../selectors/stateContextSelector';
import uniqBy from 'lodash.uniqby';

export const useGetSeenMutation = () => {
  // const { db } = DbCtx.useContainer();
  const [db, setDb] = useDexieDB();
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
              db?.getSeen?.update(1, {
                data: JSON.stringify({
                  getSeen: {
                    seenCards: uniqBy([...data, ...old?.getSeen?.seenCards], 'id'),
                  },
                }),
              }),
          ]);
        } else {
          dispatchShared({
            type: 'SET_SEEN',
            payload: {
              seenCards: data,
            },
          });
          dispatch({
            type: 'UNDISPLAY_MERGED_DATA',
            payload: {
              undisplayMergedData: data,
            },
          });
          db?.getSeen?.add(
            {
              data: JSON.stringify({
                getSeen: {
                  seenCards: data,
                },
              }),
            },
            1
          );
        }
      } else {
        dispatchShared({
          type: 'SET_SEEN',
          payload: {
            seenCards: data,
          },
        });
        dispatch({
          type: 'UNDISPLAY_MERGED_DATA',
          payload: {
            undisplayMergedData: data,
          },
        });
        db?.getSeen?.add(
          {
            data: JSON.stringify({
              getSeen: {
                seenCards: data,
              },
            }),
          },
          1
        );
      }
    });
  };
};
