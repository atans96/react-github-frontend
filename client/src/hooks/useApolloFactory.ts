import { useMutation, useQuery } from '@apollo/client';
import {
  CLICKED_ADDED,
  RSS_FEED_ADDED,
  SEARCHES_ADDED,
  SEEN_ADDED,
  SET_LANGUAGE_PREFERENCE,
  SIGN_UP_USER,
  STARRED_ME_ADDED,
  STARRED_ME_REMOVED,
  TOKEN_RSS_ADDED,
  WATCH_USER_FEEDS_ADDED,
  WATCH_USERS_ADDED,
} from '../mutations';
import {
  GET_SEARCHES,
  GET_SEEN,
  GET_STAR_RANKING,
  GET_SUGGESTED_REPO,
  GET_USER_DATA,
  GET_USER_INFO_DATA,
  GET_USER_STARRED,
  GET_WATCH_USERS,
} from '../queries';
import { useDeepMemo } from './useDeepMemo';

function useApolloFactory() {
  const [seenAdded] = useMutation(SEEN_ADDED, {
    context: { clientName: 'mongo' },
    update: (cache, data: any) => {
      cache.writeQuery({
        query: GET_SEEN,
        data: {
          getSeen: {
            seenCards: data.data.seenAdded?.seenCards,
          },
        },
      });
    },
  });

  const [clickedAdded] = useMutation(CLICKED_ADDED, {
    context: { clientName: 'mongo' },
  });
  const [tokenRSSAdded] = useMutation(TOKEN_RSS_ADDED, {
    context: { clientName: 'mongo' },
  });
  const [rssFeedAdded] = useMutation(RSS_FEED_ADDED, {
    context: { clientName: 'mongo' },
  });
  const [removeStarred] = useMutation(STARRED_ME_REMOVED, {
    context: { clientName: 'mongo' },
    update: (cache, data: any) => {
      cache.writeQuery({
        //with this, the SubscribeFeed useQuery no need to query the database again as the data will be on the cache of the useQuery in there
        query: GET_USER_STARRED,
        data: {
          getUserInfoStarred: {
            starred: data.data.starredMeRemoved?.starred,
          },
        },
      });
    },
  });
  const [addedStarredMe] = useMutation(STARRED_ME_ADDED, {
    context: { clientName: 'mongo' },
    update: (cache, data: any) => {
      cache.writeQuery({
        //with this, the SubscribeFeed useQuery no need to query the database again as the data will be on the cache of the useQuery in there
        query: GET_USER_STARRED,
        data: {
          getUserInfoStarred: {
            starred: data.data.starredMeAdded?.starred,
          },
        },
      });
    },
  });
  const [languagesPreferenceAdded] = useMutation(SET_LANGUAGE_PREFERENCE, {
    context: { clientName: 'mongo' },
    update: (cache, data: any) => {
      cache.writeQuery({
        //with this, the SubscribeFeed useQuery no need to query the database again as the data will be on the cache of the useQuery in there
        query: GET_USER_DATA,
        data: {
          getUserData: {
            languagePreference: data?.data?.setLanguagePreference?.languagePreference,
          },
        },
      });
    },
  });
  const [watchUsersAdded] = useMutation(WATCH_USERS_ADDED, {
    context: { clientName: 'mongo' },
    update: (cache, data: any) => {
      cache.writeQuery({
        //with this, the SubscribeFeed useQuery no need to query the database again as the data will be on the cache of the useQuery in there
        query: GET_WATCH_USERS,
        data: {
          getWatchUsers: {
            login: data.data.watchUsersAdded?.login,
          },
        },
      });
    },
  });
  const [watchUsersFeedsAdded] = useMutation(WATCH_USER_FEEDS_ADDED, {
    context: { clientName: 'mongo' },
  });
  const [searchesAdded] = useMutation(SEARCHES_ADDED, {
    context: { clientName: 'mongo' },
    update: (cache, data: any) => {
      cache.writeQuery({
        //with this, the SubscribeFeed useQuery no need to query the database again as the data will be on the cache of the useQuery in there
        query: GET_SEARCHES,
        data: {
          getSearches: {
            searches: data.data.searchHistoryAdded?.searches,
          },
        },
      });
    },
  });
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

  const { data: starRankingData, loading: starRankingDataLoading, error: starRankingDataError } = useQuery(
    GET_STAR_RANKING,
    {
      context: { clientName: 'mongo' },
    }
  );

  const { data: suggestedData, loading: suggestedDataLoading, error: suggestedDataError } = useQuery(
    GET_SUGGESTED_REPO,
    {
      context: { clientName: 'mongo' },
    }
  );

  const { data: watchUsersData, loading: loadingWatchUsersData, error: errorWatchUsersData } = useQuery(
    GET_WATCH_USERS,
    {
      context: { clientName: 'mongo' },
    }
  );

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
      watchUsersAdded,
      watchUsersFeedsAdded,
      searchesAdded,
      signUpAdded,
    },
    query: {
      getUserData: useDeepMemo(() => {
        return { userData, userDataLoading, userDataError };
      }, [userData, userDataLoading, userDataError]),
      getUserInfoData: useDeepMemo(() => {
        return { userInfoData, userInfoDataLoading, userInfoDataError };
      }, [userInfoData, userInfoDataLoading, userInfoDataError]),
      getUserInfoStarred: useDeepMemo(() => {
        return { userStarred, loadingUserStarred, errorUserStarred };
      }, [userStarred, loadingUserStarred, errorUserStarred]),
      getSeen: useDeepMemo(() => {
        return { seenData, seenDataLoading, seenDataError };
      }, [seenData, seenDataLoading, seenDataError]),
      getStarRanking: useDeepMemo(() => {
        return { starRankingData, starRankingDataLoading, starRankingDataError };
      }, [starRankingData, starRankingDataLoading, starRankingDataError]),
      getSuggestedRepo: useDeepMemo(() => {
        return { suggestedData, suggestedDataLoading, suggestedDataError };
      }, [suggestedData, suggestedDataLoading, suggestedDataError]),
      getWatchUsers: useDeepMemo(() => {
        return { watchUsersData, loadingWatchUsersData, errorWatchUsersData };
      }, [watchUsersData, loadingWatchUsersData, errorWatchUsersData]),
      getSearchesData: useDeepMemo(() => {
        return { searchesData, loadingSearchesData, errorSearchesData };
      }, [searchesData, loadingSearchesData, errorSearchesData]),
    },
  };
}

export default useApolloFactory;
