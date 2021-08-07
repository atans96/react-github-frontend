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
      if (!stateShared.isLoggedIn) {
        setShouldSkip(stateShared.isLoggedIn);
      }
    }, 3500);
    return () => {
      clearTimeout(timeRef.current);
    };
  }, [stateShared.isLoggedIn]);

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
          const temp: GraphQLUserData = userDataDexie;
          if (stateShared.isLoggedIn && !userDataLoading && !userDataError && temp) {
            db?.getUserData?.add({ data: JSON.stringify({ userData: temp }) });
          }
          return { userData: temp, userDataLoading: Object.keys(temp).length === 0, userDataError: undefined };
        } else {
          const temp: GraphQLUserData = userData;
          return { userData: temp, userDataLoading, userDataError };
        }
      },
      getUserInfoData: () => {
        pushConsumers(Key.getUserInfoData, path);
        if (stateShared.isLoggedIn) {
          const temp: GraphQLUserInfoData = userInfoDataDexie;
          if (stateShared.isLoggedIn && !userInfoDataLoading && !userInfoDataError && temp) {
            db?.getUserInfoData?.add({ data: JSON.stringify({ userInfoData: temp }) });
          }
          return {
            userInfoData: temp,
            userInfoDataLoading: Object.keys(temp).length === 0,
            userInfoDataError: undefined,
          };
        } else {
          const temp: GraphQLUserInfoData = userInfoData;
          return { userInfoData: temp, userInfoDataLoading, userInfoDataError };
        }
      },
      getUserInfoStarred: () => {
        pushConsumers(Key.getUserInfoStarred, path);
        if (stateShared.isLoggedIn) {
          const temp: GraphQLUserStarred = userStarredDexie;
          if (stateShared.isLoggedIn && !loadingUserStarred && !errorUserStarred && temp) {
            db?.getUserInfoStarred?.add({ data: JSON.stringify({ userStarred: temp }) });
          }
          return {
            userStarred: temp,
            loadingUserStarred: Object.keys(temp).length === 0,
            errorUserStarred: undefined,
          };
        } else {
          const temp: GraphQLUserStarred = userStarred;
          return { userStarred: temp, loadingUserStarred, errorUserStarred };
        }
      },
      getSeen: () => {
        pushConsumers(Key.getSeen, path);
        if (stateShared.isLoggedIn) {
          const temp: GraphQLSeenData = seenDataDexie;
          if (stateShared.isLoggedIn && !seenDataLoading && !seenDataError && temp) {
            db?.getSeen?.add({ data: JSON.stringify({ seenData: temp }) }, 1);
          }
          return {
            seenData: temp,
            seenDataLoading: Object.keys(temp).length === 0,
            seenDataError: undefined,
          };
        } else {
          const temp: GraphQLSeenData = seenData;
          return { seenData: temp, seenDataLoading, seenDataError };
        }
      },
      getSearchesData: () => {
        pushConsumers(Key.getSearchesData, path);
        if (stateShared.isLoggedIn) {
          const temp: GraphQLSearchesData = searchesDataDexie;
          if (stateShared.isLoggedIn && !loadingSearchesData && !errorSearchesData && temp) {
            db?.getSearchesData?.add({ data: JSON.stringify({ searchesData: temp }) });
          }
          return {
            searchesData: temp,
            loadingSearchesData: Object.keys(temp).length === 0,
            errorSearchesData: undefined,
          };
        } else {
          const temp: GraphQLSearchesData = searchesData;
          return { searchesData: temp, loadingSearchesData, errorSearchesData };
        }
      },
    },
  };
};
