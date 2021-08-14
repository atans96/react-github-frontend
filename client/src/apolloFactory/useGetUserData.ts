import DbCtx from '../db/db.ctx';
import { createStore } from '../util/hooksy';
import { useTrackedStateShared } from '../selectors/stateContextSelector';
import { useLazyQuery } from '@apollo/client';
import { GET_USER_DATA } from '../graphql/queries';
import { pushConsumers } from '../util/util';
import { GraphQLUserData } from '../typing/interface';
import { Key } from '../typing/enum';

const defaultUserData: GraphQLUserData | any = {};
export const [useUserDataDexie] = createStore(defaultUserData);

export const useGetUserData = (path: string) => {
  const [userDataDexie, setUserDataDexie] = useUserDataDexie();
  const { db } = DbCtx.useContainer();
  const [stateShared] = useTrackedStateShared();

  const [getUserData, { data: userData, loading: userDataLoading, error: userDataError }] = useLazyQuery(
    GET_USER_DATA,
    {
      context: { clientName: 'mongo' },
    }
  );

  return {
    query: () => {
      pushConsumers(Key.getUserData, path);
      switch (stateShared.isLoggedIn) {
        case true:
          switch (userDataDexie) {
            case undefined:
              switch (true) {
                case userData?.getUserData && Object.keys(userData?.getUserData).length > 0:
                  db.getUserData.add({ data: JSON.stringify({ getUserData: userData?.getUserData }) }, 1).then(() => {
                    setUserDataDexie({ getUserData: userData?.getUserData });
                  });
                  return {
                    userData: userData as GraphQLUserData,
                    userDataLoading,
                    userDataError,
                  };
                default:
                  return {
                    userData: userData as GraphQLUserData,
                    userDataLoading,
                    userDataError,
                  };
              }
            default:
              if (userDataDexie?.getUserData && Object.keys(userDataDexie?.getUserData).length > 0) {
                return {
                  userData: userDataDexie as GraphQLUserData,
                  userDataLoading: false,
                  userDataError: undefined,
                };
              } else {
                db?.getUserData?.get(1).then((oldData: any) => {
                  if (oldData?.data) {
                    setUserDataDexie({ getUserData: JSON.parse(oldData.data).getUserData } as GraphQLUserData);
                  } else {
                    getUserData();
                    setUserDataDexie(undefined);
                  }
                });
              }
          }
          break;
        case false:
          return { userData: userData as GraphQLUserData, userDataLoading, userDataError };
        default:
          return { userData: userData as GraphQLUserData, userDataLoading, userDataError };
      }
      return { userData: userData as GraphQLUserData, userDataLoading, userDataError };
    },
  };
};
