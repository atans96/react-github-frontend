import { GraphQLUserData } from '../typing/interface';
import { Pick2 } from '../typing/type';
import { useDexieDB } from '../db/db.ctx';

export const useGetUserDataMutation = () => {
  // const { db } = DbCtx.useContainer();
  const [db, setDb] = useDexieDB();
  return async function (data: Pick2<GraphQLUserData, 'getUserData', 'languagePreference'>) {
    db?.getUserData.get(1).then((oldData: any) => {
      if (oldData?.data) {
        const old: GraphQLUserData = JSON.parse(oldData.data);
        if (old?.getUserData?.languagePreference?.length > 0) {
          db?.getUserData?.update(1, {
            data: JSON.stringify({
              getUserData: {
                ...old.getUserData,
                languagePreference: [...data.getUserData.languagePreference],
              },
            }),
          });
        }
      }
    });
  };
};
