import { GraphQLClickedData } from '../typing/interface';
import { parallel } from 'async';
import { useDexieDB } from '../db/db.ctx';
import { Clicked, Nullable } from '../typing/type';
import uniqBy from 'lodash.uniqby';

export const useGetClickedMutation = () => {
  // const { db } = DbCtx.useContainer();
  const [db, setDb] = useDexieDB();
  const oldExistAndProperty = (data: GraphQLClickedData, old: GraphQLClickedData) => {
    return parallel([
      () =>
        db?.getClicked?.update(1, {
          data: JSON.stringify({
            getClicked: {
              clicked: [...data.getClicked.clicked, ...old?.getClicked?.clicked],
            },
          }),
        }),
    ]);
  };
  const oldExistAndNoProperty = (data: Nullable<Clicked[] | []>, old: GraphQLClickedData) => {
    return db?.getClicked?.update(1, {
      data: JSON.stringify({
        getClicked: {
          clicked: uniqBy([...data, ...old?.getClicked?.clicked], 'full_name'),
        },
      }),
    });
  };
  const noOldAndProperty = (data: GraphQLClickedData) => {
    return db?.getClicked?.add(
      {
        data: JSON.stringify({
          getClicked: {
            clicked: data.getClicked.clicked,
          },
        }),
      },
      1
    );
  };
  const noOldAndNoProperty = (data: Nullable<Clicked[] | []>) => {
    return db?.getClicked?.add(
      {
        data: JSON.stringify({
          getClicked: {
            clicked: data,
          },
        }),
      },
      1
    );
  };
  return async function (data: GraphQLClickedData | Nullable<Clicked[] | []>) {
    db?.getClicked.get(1).then((oldData: any) => {
      if (oldData?.data) {
        const old: GraphQLClickedData = JSON.parse(oldData.data);
        if (old?.getClicked?.clicked && old?.getClicked?.clicked?.length > 0) {
          if (data && 'getClicked' in data) {
            oldExistAndProperty(data, old);
          } else if (data) {
            oldExistAndNoProperty(data, old);
          }
        } else {
          if (data && 'getClicked' in data) {
            noOldAndProperty(data);
          } else if (data) {
            noOldAndNoProperty(data);
          }
        }
      } else {
        if (data && 'getClicked' in data) {
          noOldAndProperty(data);
        } else if (data) {
          noOldAndNoProperty(data);
        }
      }
    });
  };
};
