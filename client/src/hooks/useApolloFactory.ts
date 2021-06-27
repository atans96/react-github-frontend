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

const consumers: Record<string, Array<string>> = {};

function pushConsumers(property: string, path: string) {
  if (consumers[path] && !consumers[path].includes(property)) {
    consumers[path].push(property);
  } else if (consumers[path] == undefined) {
    consumers[path] = [property];
  }
}

export function useApolloFactory(path: string) {
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
  const tokenRSSAdded = async (data: Pick2<GraphQLUserData, 'getUserData', 'tokenRSS'>) => {
    const oldData: GraphQLUserData | null = (await client.cache.readQuery({ query: GET_USER_DATA })) || null;
    if (oldData) {
      await client.cache.writeQuery({
        query: GET_USER_DATA,
        data: {
          ...oldData,
          tokenRSS: data.getUserData.tokenRSS,
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
  const { data: userData, loading: userDataLoading, error: userDataError } = useQuery(GET_USER_DATA, {
    context: { clientName: 'mongo' },
  });
  const { data: userInfoData, loading: userInfoDataLoading, error: userInfoDataError } = useQuery(GET_USER_INFO_DATA, {
    context: { clientName: 'mongo' },
  });

  const { data: userStarred, loading: loadingUserStarred, error: errorUserStarred } = useQuery(GET_USER_STARRED, {
    context: { clientName: 'mongo' },
  });

  const { data: seenData, loading: seenDataLoading, error: seenDataError } = useQuery(GET_SEEN, {
    context: { clientName: 'mongo' },
  });

  const { data: searchesData, loading: loadingSearchesData, error: errorSearchesData } = useQuery(GET_SEARCHES, {
    context: { clientName: 'mongo' },
  });
  return {
    mutation: {
      seenAdded,
      clickedAdded,
      tokenRSSAdded,
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
        pushConsumers('getUserData', path);
        const temp: GraphQLUserData = userData;
        return { userData: temp, userDataLoading, userDataError };
      },
      getUserInfoData: () => {
        const temp: GraphQLUserInfoData = userInfoData;
        pushConsumers('getUserInfoData', path);
        return { userInfoData: temp, userInfoDataLoading, userInfoDataError };
      },
      getUserInfoStarred: () => {
        const temp: GraphQLUserStarred = userStarred;
        pushConsumers('getUserInfoStarred', path);
        return { userStarred: temp, loadingUserStarred, errorUserStarred };
      },
      getSeen: () => {
        const temp: GraphQLSeenData = seenData;
        pushConsumers('getSeen', path);
        return { seenData: temp, seenDataLoading, seenDataError };
      },
      getSearchesData: () => {
        const temp: GraphQLSearchesData = searchesData;
        pushConsumers('getSearchesData', path);
        return { searchesData: temp, loadingSearchesData, errorSearchesData };
      },
    },
  };
}
