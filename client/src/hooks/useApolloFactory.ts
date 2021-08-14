import { useApolloClient, useQuery } from '@apollo/client';
import { GET_CLICKED, GET_USER_INFO_DATA } from '../graphql/queries';
import { GraphQLClickedData, GraphQLUserInfoData } from '../typing/interface';
import { useTrackedStateShared } from '../selectors/stateContextSelector';
import { useUserInfoDataDexie } from '../db/db.ctx';
import { pushConsumers } from '../util/util';
import { Key } from '../typing/enum';

export const useApolloFactory = (path: string) => {
  const [userInfoDataDexie] = useUserInfoDataDexie();
  const [stateShared] = useTrackedStateShared();
  const client = useApolloClient();

  const clickedAdded = async (data: GraphQLClickedData) => {
    const oldData: GraphQLClickedData | null = (await client.cache.readQuery({ query: GET_CLICKED })) || null;
    if (oldData && oldData.getClicked.clicked && oldData.getClicked.clicked.length > 0) {
      return client.cache.writeQuery({
        query: GET_CLICKED,
        data: {
          getClicked: {
            clicked: [...data.getClicked.clicked, ...oldData?.getClicked?.clicked],
          },
        },
      });
    } else {
      return client.cache.writeQuery({
        query: GET_CLICKED,
        data: {
          getClicked: {
            clicked: data.getClicked.clicked,
          },
        },
      });
    }
  };

  const {
    data: userInfoData,
    loading: userInfoDataLoading,
    error: userInfoDataError,
  } = useQuery(GET_USER_INFO_DATA, {
    context: { clientName: 'mongo' },
    skip: true,
  });

  return {
    mutation: {
      clickedAdded,
    },
    query: {
      getUserInfoData: () => {
        pushConsumers(Key.getUserInfoData, path);
        if (stateShared.isLoggedIn) {
          if (Object.keys(userInfoDataDexie).length > 0) {
            return {
              userInfoData: userInfoDataDexie as GraphQLUserInfoData,
              userInfoDataLoading: Object.keys(userInfoDataDexie).length === 0,
              userInfoDataError: undefined,
            };
          }
          return {
            userInfoData: userInfoData as GraphQLUserInfoData,
            userInfoDataLoading,
            userInfoDataError,
          };
        } else {
          return { userInfoData: userInfoData as GraphQLUserInfoData, userInfoDataLoading, userInfoDataError };
        }
      },
    },
  };
};
