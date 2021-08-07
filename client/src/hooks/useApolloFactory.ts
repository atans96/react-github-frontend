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
  const {
    data: userInfoData,
    loading: userInfoDataLoading,
    error: userInfoDataError,
  } = useQuery(GET_USER_INFO_DATA, {
    context: { clientName: 'mongo' },
    skip: shouldSkip,
  });

  const {
    data: userStarred,
    loading: loadingUserStarred,
    error: errorUserStarred,
  } = useQuery(GET_USER_STARRED, {
    context: { clientName: 'mongo' },
    skip: shouldSkip,
  });

  const {
    data: seenData,
    loading: seenDataLoading,
    error: seenDataError,
  } = useQuery(GET_SEEN, {
    context: { clientName: 'mongo' },
    skip: shouldSkip,
  });

  const {
    data: searchesData,
    loading: loadingSearchesData,
    error: errorSearchesData,
  } = useQuery(GET_SEARCHES, {
    context: { clientName: 'mongo' },
    skip: shouldSkip,
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
          if (!userDataLoading && !userDataError && Object.keys(userDataDexie).length > 0) {
            return {
              userData: userDataDexie as GraphQLUserData,
              userDataLoading: Object.keys(userDataDexie).length === 0,
              userDataError: undefined,
            };
          } else if (
            !userDataLoading &&
            !userDataError &&
            userData &&
            Object.keys(userDataDexie).length === 0 &&
            Object.keys(userData).length > 0
          ) {
            db?.getUserData?.add({ data: JSON.stringify({ userData }) });
            return {
              userData: userData as GraphQLUserData,
              userDataLoading: Object.keys(userData).length === 0,
              userDataError: undefined,
            };
          } else {
            return {
              userData: userDataDexie as GraphQLUserData,
              userDataLoading: Object.keys(userDataDexie).length === 0,
              userDataError: undefined,
            };
          }
        } else {
          return { userData: userData as GraphQLUserData, userDataLoading, userDataError };
        }
      },
      getUserInfoData: () => {
        pushConsumers(Key.getUserInfoData, path);
        if (stateShared.isLoggedIn) {
          if (!userInfoDataLoading && !userInfoDataError && Object.keys(userInfoDataDexie).length > 0) {
            return {
              userInfoData: userInfoDataDexie as GraphQLUserInfoData,
              userInfoDataLoading: Object.keys(userInfoDataDexie).length === 0,
              userInfoDataError: undefined,
            };
          } else if (
            !userInfoDataLoading &&
            !userInfoDataError &&
            userInfoData &&
            Object.keys(userInfoDataDexie).length === 0 &&
            Object.keys(userInfoData).length > 0
          ) {
            db?.getUserInfoData?.add({ data: JSON.stringify({ userInfoData }) });
            return {
              userInfoData: userInfoData as GraphQLUserInfoData,
              userInfoDataLoading: Object.keys(userInfoData).length === 0,
              userInfoDataError: undefined,
            };
          } else {
            return {
              userInfoData: userInfoDataDexie as GraphQLUserInfoData,
              userInfoDataLoading: Object.keys(userInfoDataDexie).length === 0,
              userInfoDataError: undefined,
            };
          }
        } else {
          return { userInfoData: userInfoData as GraphQLUserInfoData, userInfoDataLoading, userInfoDataError };
        }
      },
      getUserInfoStarred: () => {
        pushConsumers(Key.getUserInfoStarred, path);
        if (stateShared.isLoggedIn) {
          if (!loadingUserStarred && !errorUserStarred && Object.keys(userStarredDexie).length > 0) {
            return {
              userStarred: userStarredDexie as GraphQLUserStarred,
              loadingUserStarred: Object.keys(userStarredDexie).length === 0,
              errorUserStarred: undefined,
            };
          } else if (
            !loadingUserStarred &&
            !errorUserStarred &&
            userStarred &&
            Object.keys(userStarredDexie).length === 0 &&
            Object.keys(userStarred).length > 0
          ) {
            db?.getUserInfoStarred?.add({ data: JSON.stringify({ userStarred }) });
            return {
              userStarred: userStarred as GraphQLUserStarred,
              loadingUserStarred: Object.keys(userStarred).length === 0,
              errorUserStarred: undefined,
            };
          } else {
            return {
              userStarred: userStarredDexie as GraphQLUserStarred,
              loadingUserStarred: Object.keys(userStarredDexie).length === 0,
              errorUserStarred: undefined,
            };
          }
        } else {
          return { userStarred: userStarred as GraphQLUserStarred, loadingUserStarred, errorUserStarred };
        }
      },
      getSeen: () => {
        pushConsumers(Key.getSeen, path);
        if (stateShared.isLoggedIn) {
          if (!seenDataLoading && !seenDataError && Object.keys(seenDataDexie).length > 0) {
            return {
              seenData: seenDataDexie as GraphQLSeenData,
              seenDataLoading: Object.keys(seenDataDexie).length === 0,
              seenDataError: undefined,
            };
          } else if (
            !seenDataLoading &&
            !seenDataError &&
            seenData &&
            Object.keys(seenDataDexie).length === 0 &&
            Object.keys(seenData).length > 0
          ) {
            db?.getSeen?.add({ data: JSON.stringify({ seenData }) });
            return {
              seenData: seenData as GraphQLSeenData,
              seenDataLoading: Object.keys(seenData).length === 0,
              seenDataError: undefined,
            };
          } else {
            return {
              seenData: seenDataDexie as GraphQLSeenData,
              seenDataLoading: Object.keys(seenDataDexie).length === 0,
              seenDataError: undefined,
            };
          }
        } else {
          const temp: GraphQLSeenData = seenData;
          return { seenData: temp, seenDataLoading, seenDataError };
        }
      },
      getSearchesData: () => {
        pushConsumers(Key.getSearchesData, path);
        if (stateShared.isLoggedIn) {
          if (!loadingSearchesData && !errorSearchesData && Object.keys(searchesDataDexie).length > 0) {
            return {
              searchesData: searchesDataDexie as GraphQLSearchesData,
              loadingSearchesData: Object.keys(searchesDataDexie).length === 0,
              errorSearchesData: undefined,
            };
          } else if (
            !loadingSearchesData &&
            !errorSearchesData &&
            searchesData &&
            Object.keys(searchesDataDexie).length === 0 &&
            Object.keys(searchesData).length > 0
          ) {
            db?.getSearchesData?.add({ data: JSON.stringify({ searchesData }) });
            return {
              searchesData: searchesData as GraphQLSearchesData,
              loadingSearchesData: Object.keys(searchesData).length === 0,
              errorSearchesData: undefined,
            };
          } else {
            return {
              searchesData: searchesDataDexie as GraphQLSearchesData,
              loadingSearchesData: Object.keys(searchesDataDexie).length === 0,
              errorSearchesData: undefined,
            };
          }
        } else {
          const temp: GraphQLSearchesData = searchesData;
          return { searchesData: temp, loadingSearchesData, errorSearchesData };
        }
      },
    },
  };
};
