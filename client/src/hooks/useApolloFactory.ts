import { useApolloClient, useQuery } from '@apollo/client';
import { GET_CLICKED, GET_RSS_FEED, GET_USER_DATA, GET_USER_INFO_DATA, GET_USER_STARRED } from '../graphql/queries';
import { GraphQLClickedData, GraphQLRSSFeedData, GraphQLUserData, GraphQLUserInfoData } from '../typing/interface';
import { Pick2 } from '../typing/type';
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

  const rssFeedAdded = async (data: GraphQLRSSFeedData) => {
    const oldData: GraphQLRSSFeedData | null = (await client.cache.readQuery({ query: GET_RSS_FEED })) || null;
    if (
      oldData &&
      oldData.getRSSFeed.rss &&
      oldData.getRSSFeed.rss.length > 0 &&
      oldData.getRSSFeed.lastSeen &&
      oldData.getRSSFeed.lastSeen.length > 0
    ) {
      await client.cache.writeQuery({
        query: GET_RSS_FEED,
        data: {
          getRSSFeed: {
            rss: [...data.getRSSFeed.rss, ...oldData?.getRSSFeed?.rss],
            lastSeen: [...data.getRSSFeed.lastSeen, ...oldData?.getRSSFeed?.lastSeen],
          },
        },
      });
    } else {
      await client.cache.writeQuery({
        query: GET_RSS_FEED,
        data: {
          getRSSFeed: {
            rss: data.getRSSFeed.rss,
            lastSeen: data.getRSSFeed.lastSeen,
          },
        },
      });
    }
    return (await client.cache.readQuery({ query: GET_RSS_FEED })) as GraphQLRSSFeedData;
  };

  const languagesPreferenceAdded = async (data: Pick2<GraphQLUserData, 'getUserData', 'languagePreference'>) => {
    const oldData: GraphQLUserData | null = (await client.cache.readQuery({ query: GET_USER_DATA })) || null;
    if (oldData) {
      await client.cache.writeQuery({
        query: GET_USER_DATA,
        data: {
          ...oldData,
          languagePreference: [...data.getUserData.languagePreference],
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
      rssFeedAdded,
      languagesPreferenceAdded,
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
