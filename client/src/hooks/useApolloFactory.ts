import { useApolloClient, useQuery } from '@apollo/client';
import {
  GET_CLICKED,
  GET_RSS_FEED,
  GET_SEARCHES,
  GET_SEEN,
  GET_USER_DATA,
  GET_USER_INFO_DATA,
  GET_USER_STARRED,
} from '../graphql/queries';
import {
  GraphQLClickedData,
  GraphQLRSSFeedData,
  GraphQLSearchesData,
  GraphQLSeenData,
  GraphQLUserData,
  GraphQLUserInfoData,
  GraphQLUserStarred,
} from '../typing/interface';
import { Pick2, SeenProps } from '../typing/type';
import { useTrackedStateShared } from '../selectors/stateContextSelector';
import DbCtx, {
  useSearchesDataDexie,
  useSeenDataDexie,
  useUserDataDexie,
  useUserInfoDataDexie,
  useUserStarredDexie,
} from '../db/db.ctx';
import { useEffect, useRef, useState } from 'react';
enum Key {
  getUserData = 'getUserData',
  getUserInfoData = 'getUserInfoData',
  getUserInfoStarred = 'getUserInfoStarred',
  getSeen = 'getSeen',
  getSearchesData = 'getSearchesData',
}
const consumers: Record<string, Array<string>> = {};
function pushConsumers(property: Key, path: string) {
  if (consumers[path] && !consumers[path].includes(property)) {
    consumers[path].push(property);
  } else if (consumers[path] == undefined) {
    consumers[path] = [property];
  }
}
export const useApolloFactory = (path: string) => {
  const { db } = DbCtx.useContainer();

  const [userDataDexie] = useUserDataDexie();
  const [userInfoDataDexie] = useUserInfoDataDexie();
  const [userStarredDexie] = useUserStarredDexie();
  const [seenDataDexie] = useSeenDataDexie();
  const [searchesDataDexie] = useSearchesDataDexie();

  const [stateShared] = useTrackedStateShared();
  const [shouldSkip, setShouldSkip] = useState(true);
  const timeRef = useRef<any>();

  useEffect(() => {
    timeRef.current = setTimeout(() => {
      if (!stateShared.isLoggedIn || Object.keys(userDataDexie).length === 0) {
        setShouldSkip(false);
      }
    }, 3500);
    return () => {
      clearTimeout(timeRef.current);
    };
  }, [stateShared.isLoggedIn, userDataDexie]);

  const client = useApolloClient();
  const seenAdded = async (data: SeenProps[]) => {
    const oldData: GraphQLSeenData | null = (await client.cache.readQuery({ query: GET_SEEN })) || null;
    if (oldData && oldData.getSeen) {
      return client.cache.writeQuery({
        query: GET_SEEN,
        data: {
          getSeen: {
            seenCards: [...data, ...oldData?.getSeen?.seenCards],
          },
        },
      });
    } else {
      return client.cache.writeQuery({
        query: GET_SEEN,
        data: {
          getSeen: {
            seenCards: data,
          },
        },
      });
    }
  };

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
  const removeStarred = async (data: { removeStarred: number }) => {
    const oldData: GraphQLUserStarred | null = (await client.cache.readQuery({ query: GET_USER_STARRED })) || null;
    if (oldData && oldData.getUserInfoStarred.starred.length > 0) {
      await client.cache.writeQuery({
        query: GET_USER_STARRED,
        data: {
          getUserInfoStarred: {
            starred: oldData.getUserInfoStarred.starred.filter((old) => old !== data.removeStarred),
          },
        },
      });
    }
  };
  const addedStarredMe = async (data: GraphQLUserStarred) => {
    const oldData: GraphQLUserStarred | null = (await client.cache.readQuery({ query: GET_USER_STARRED })) || null;
    if (oldData && oldData.getUserInfoStarred.starred.length > 0) {
      await client.cache.writeQuery({
        query: GET_USER_STARRED,
        data: {
          getUserInfoStarred: {
            starred: [...oldData.getUserInfoStarred.starred, ...data.getUserInfoStarred.starred],
          },
        },
      });
    } else {
      await client.cache.writeQuery({
        query: GET_USER_STARRED,
        data: {
          getUserInfoStarred: {
            starred: data.getUserInfoStarred.starred,
          },
        },
      });
    }
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
  const searchesAdded = async (data: GraphQLSearchesData) => {
    const oldData: GraphQLSearchesData | null = (await client.cache.readQuery({ query: GET_SEARCHES })) || null;
    if (oldData && oldData.getSearches.searches.length > 0) {
      await client.cache.writeQuery({
        query: GET_SEARCHES,
        data: {
          getSearches: oldData.getSearches.searches.unshift.apply(oldData.getSearches, data.getSearches.searches), //the newest always at top
        },
      });
    } else {
      await client.cache.writeQuery({
        query: GET_SEARCHES,
        data: {
          getSearches: [...data.getSearches.searches],
        },
      });
    }
  };
  const {
    data: userData,
    loading: userDataLoading,
    error: userDataError,
  } = useQuery(GET_USER_DATA, {
    context: { clientName: 'mongo' },
    skip: shouldSkip,
  });
  db?.transaction('rw', [db.getUserData], async () => {
    const getUserData = await db.getUserData.get(1);
    if (!getUserData && userData?.getUserData && Object.keys(userData.getUserData).length > 0) {
      db?.getUserData?.add({ data: JSON.stringify({ userData }) }, 1);
    }
  });

  const {
    data: userInfoData,
    loading: userInfoDataLoading,
    error: userInfoDataError,
  } = useQuery(GET_USER_INFO_DATA, {
    context: { clientName: 'mongo' },
    skip: shouldSkip,
  });
  db?.transaction('rw', [db.getUserInfoData], async () => {
    const getUserInfoData = await db.getUserInfoData.get(1);
    if (!getUserInfoData && userInfoData?.getUserInfoData && Object.keys(userInfoData.getUserInfoData).length > 0) {
      db?.getUserInfoData?.add({ data: JSON.stringify({ userInfoData }) }, 1);
    }
  });

  const {
    data: userStarred,
    loading: loadingUserStarred,
    error: errorUserStarred,
  } = useQuery(GET_USER_STARRED, {
    context: { clientName: 'mongo' },
    skip: shouldSkip,
  });
  db?.transaction('rw', [db.getUserInfoStarred], async () => {
    const getUserInfoStarred = await db.getUserInfoStarred.get(1);
    if (
      !getUserInfoStarred &&
      userStarred?.getUserInfoStarred &&
      Object.keys(userStarred.getUserInfoStarred).length > 0
    ) {
      db?.getUserInfoStarred?.add({ data: JSON.stringify({ userStarred }) }, 1);
    }
  });

  const {
    data: seenData,
    loading: seenDataLoading,
    error: seenDataError,
  } = useQuery(GET_SEEN, {
    context: { clientName: 'mongo' },
    skip: shouldSkip,
  });
  db?.transaction('rw', [db.getSeen], async () => {
    const getSeen = await db.getSeen.get(1);
    if (!getSeen && seenData?.getSeen?.seenCards?.length > 0) {
      db?.getSeen?.add({ data: JSON.stringify({ seenData }) }, 1);
    }
  });

  const {
    data: searchesData,
    loading: loadingSearchesData,
    error: errorSearchesData,
  } = useQuery(GET_SEARCHES, {
    context: { clientName: 'mongo' },
    skip: shouldSkip,
  });
  db?.transaction('rw', [db.getSearchesData], async () => {
    const getSearchesData = await db.getSearchesData.get(1);
    if (!getSearchesData && searchesData?.getSearches?.searches?.length > 0) {
      db?.getSearchesData?.add({ data: JSON.stringify({ searchesData }) }, 1);
    }
  });

  return {
    mutation: {
      seenAdded,
      clickedAdded,
      rssFeedAdded,
      removeStarred,
      addedStarredMe,
      languagesPreferenceAdded,
      searchesAdded,
    },
    consumers: () => {
      return { consumers };
    },
    query: {
      getUserData: () => {
        pushConsumers(Key.getUserData, path);
        if (stateShared.isLoggedIn) {
          if (Object.keys(userDataDexie).length > 0) {
            return {
              userData: userDataDexie as GraphQLUserData,
              userDataLoading: Object.keys(userDataDexie).length === 0,
              userDataError: undefined,
            };
          }
          return {
            userData: userData as GraphQLUserData,
            userDataLoading,
            userDataError,
          };
        } else {
          return { userData: userData as GraphQLUserData, userDataLoading, userDataError };
        }
      },
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
      getUserInfoStarred: () => {
        pushConsumers(Key.getUserInfoStarred, path);
        if (stateShared.isLoggedIn) {
          if (Object.keys(userStarredDexie).length > 0) {
            return {
              userStarred: userStarredDexie as GraphQLUserStarred,
              loadingUserStarred: Object.keys(userStarredDexie).length === 0,
              errorUserStarred: undefined,
            };
          }
          return {
            userStarred: userStarred as GraphQLUserStarred,
            loadingUserStarred,
            errorUserStarred,
          };
        } else {
          return { userStarred: userStarred as GraphQLUserStarred, loadingUserStarred, errorUserStarred };
        }
      },
      getSeen: () => {
        pushConsumers(Key.getSeen, path);
        if (stateShared.isLoggedIn) {
          if (Object.keys(seenDataDexie).length > 0) {
            return {
              seenData: seenDataDexie as GraphQLSeenData,
              seenDataLoading: Object.keys(seenDataDexie).length === 0,
              seenDataError: undefined,
            };
          }
          return {
            seenData: seenData as GraphQLSeenData,
            seenDataLoading,
            seenDataError,
          };
        } else {
          const temp: GraphQLSeenData = seenData;
          return { seenData: temp, seenDataLoading, seenDataError };
        }
      },
      getSearchesData: () => {
        pushConsumers(Key.getSearchesData, path);
        if (stateShared.isLoggedIn) {
          if (Object.keys(searchesDataDexie).length > 0) {
            return {
              searchesData: searchesDataDexie as GraphQLSearchesData,
              loadingSearchesData: Object.keys(searchesDataDexie).length === 0,
              errorSearchesData: undefined,
            };
          }
          return {
            searchesData: searchesData as GraphQLSearchesData,
            loadingSearchesData,
            errorSearchesData,
          };
        } else {
          const temp: GraphQLSearchesData = searchesData;
          return { searchesData: temp, loadingSearchesData, errorSearchesData };
        }
      },
    },
  };
};
