import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { SIGN_UP_USER } from '../graphql/mutations';
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
  const seenAdded = async (data: any[]) => {
    const oldData: GraphQLSeenData = (await client.cache.readQuery({ query: GET_SEEN })) || {
      getSeen: { seenCards: [] },
    };
    if (oldData.getSeen) {
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
    const oldData: GraphQLClickedData = (await client.cache.readQuery({ query: GET_CLICKED })) || {
      getClicked: { clicked: [], userName: 'wa1618i' },
    };
    if (oldData.getClicked.clicked && oldData.getClicked.clicked.length > 0) {
      return client.cache.writeQuery({
        query: GET_CLICKED,
        data: {
          getClicked: {
            userName: oldData.getClicked.userName,
            seenCards: [...data.getClicked.clicked, ...oldData?.getClicked?.clicked],
          },
        },
      });
    } else {
      return client.cache.writeQuery({
        query: GET_CLICKED,
        data: {
          getClicked: {
            userName: data.getClicked.userName,
            seenCards: data.getClicked.clicked,
          },
        },
      });
    }
  };
  const tokenRSSAdded = async (data: { getUserData: { tokenRSS: string } }) => {
    const oldData: GraphQLUserData = (await client.cache.readQuery({ query: GET_USER_DATA })) || {
      getUserData: {
        avatar: '',
        userName: 'wa1618i',
        token: '',
        tokenRSS: '',
        languagePreference: [],
        code: '',
        joinDate: new Date(),
      },
    };
    await client.cache.writeQuery({
      query: GET_USER_DATA,
      data: {
        ...oldData,
        tokenRSS: data.getUserData.tokenRSS,
      },
    });
  };
  const rssFeedAdded = async (data: GraphQLRSSFeedData) => {
    const oldData: GraphQLRSSFeedData = (await client.cache.readQuery({ query: GET_RSS_FEED })) || {
      getRSSFeed: { rss: [], userName: 'wa1618i', lastSeen: [] },
    };
    if (
      oldData.getRSSFeed.rss &&
      oldData.getRSSFeed.rss.length > 0 &&
      oldData.getRSSFeed.lastSeen &&
      oldData.getRSSFeed.lastSeen.length > 0
    ) {
      await client.cache.writeQuery({
        query: GET_RSS_FEED,
        data: {
          getRSSFeed: {
            userName: oldData.getRSSFeed.userName,
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
            userName: oldData.getRSSFeed.userName,
            rss: data.getRSSFeed.rss,
            lastSeen: data.getRSSFeed.lastSeen,
          },
        },
      });
    }
    return (await client.cache.readQuery({ query: GET_RSS_FEED })) as GraphQLRSSFeedData;
  };
  const removeStarred = async (data: { removeStarred: number }) => {
    const oldData: GraphQLUserStarred = (await client.cache.readQuery({ query: GET_USER_STARRED })) || {
      getUserInfoStarred: {
        userName: 'wa1618i',
        starred: [],
      },
    };
    if (oldData.getUserInfoStarred.starred.length > 0) {
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
  const addedStarredMe = async (data: { getUserInfoStarred: { starred: number[] } }) => {
    const oldData: GraphQLUserStarred = (await client.cache.readQuery({ query: GET_USER_STARRED })) || {
      getUserInfoStarred: {
        userName: 'wa1618i',
        starred: [],
      },
    };
    if (oldData.getUserInfoStarred.starred.length > 0) {
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
  const languagesPreferenceAdded = async (data: {
    getUserData: { languagePreference: [{ language: string; checked: boolean }] };
  }) => {
    const oldData: GraphQLUserData = (await client.cache.readQuery({ query: GET_USER_DATA })) || {
      getUserData: {
        avatar: '',
        userName: 'wa1618i',
        token: '',
        tokenRSS: '',
        languagePreference: [],
        code: '',
        joinDate: new Date(),
      },
    };
    await client.cache.writeQuery({
      query: GET_USER_DATA,
      data: {
        ...oldData,
        languagePreference: [...data.getUserData.languagePreference],
      },
    });
  };
  const searchesAdded = async (data: GraphQLSearchesData) => {
    const oldData: GraphQLSearchesData = (await client.cache.readQuery({ query: GET_SEARCHES })) || {
      getSearches: [{ search: '', count: 0, updatedAt: new Date() }],
    };
    if (oldData.getSearches.length > 0) {
      await client.cache.writeQuery({
        query: GET_SEARCHES,
        data: {
          getSearches: [...data.getSearches, ...oldData.getSearches],
        },
      });
    } else {
      await client.cache.writeQuery({
        query: GET_SEARCHES,
        data: {
          getSearches: [...data.getSearches],
        },
      });
    }
  };
  const [signUpAdded] = useMutation(SIGN_UP_USER, {
    context: { clientName: 'mongo' },
  });
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
      signUpAdded,
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
