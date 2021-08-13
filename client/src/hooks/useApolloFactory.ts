import { useApolloClient, useLazyQuery, useQuery } from '@apollo/client';
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
import { Pick2, Searches, SeenProps } from '../typing/type';
import { useTrackedStateShared } from '../selectors/stateContextSelector';
import DbCtx from '../db/db.ctx';
import { map, parallel } from 'async';
import { noop } from '../util/util';
import { createStore } from '../util/hooksy';

enum Key {
  getUserData = 'getUserData',
  getUserInfoData = 'getUserInfoData',
  getUserInfoStarred = 'getUserInfoStarred',
  getSeen = 'getSeen',
  getSearches = 'getSearches',
}

const consumers: Record<string, Array<string>> = {};

function pushConsumers(property: Key, path: string) {
  if (consumers[path] && !consumers[path].includes(property)) {
    consumers[path].push(property);
  } else if (consumers[path] == undefined) {
    consumers[path] = [property];
  }
}
const defaultUserData: GraphQLUserData | any = {};
const defaultSearchesData: GraphQLSearchesData | any = {};
const defaultUserInfoData: GraphQLUserInfoData | any = {};
const defaultUserStarred: GraphQLUserStarred | any = {};
const defaultSeenData: GraphQLSeenData | any = {};
const defaultRSSFeed: GraphQLRSSFeedData | any = {};
export const [useUserDataDexie] = createStore(defaultUserData);
export const [useSearchesDataDexie] = createStore(defaultSearchesData);
export const [useRSSFeedDexie] = createStore(defaultRSSFeed);
export const [useUserInfoDataDexie] = createStore(defaultUserInfoData);
export const [useUserStarredDexie] = createStore(defaultUserStarred);
export const [useSeenDataDexie] = createStore(defaultSeenData);

function once(fn: any) {
  let result: any;
  return function () {
    if (fn) {
      result = fn.apply(null);
      fn = null;
    }
    return result;
  };
}
export const useApolloFactory = (path: string) => {
  const { db } = DbCtx.useContainer();
  const [userDataDexie, setUserDataDexie] = useUserDataDexie();
  const [userInfoDataDexie, setUserInfoDataDexie] = useUserInfoDataDexie();
  const [userStarredDexie, setUserStarredDexie] = useUserStarredDexie();
  const [seenDataDexie, setSeenDataDexie] = useSeenDataDexie();
  const [searchesDataDexie, setSearchesDataDexie] = useSearchesDataDexie();

  const [stateShared] = useTrackedStateShared();

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
    db?.transaction('rw', [db.getSearches], () => {
      db.getSearches.get(1).then((oldData: any) => {
        if (oldData?.data) {
          let needAppend = true;
          map(
            [...JSON.parse(oldData.data).getSearches.searches],
            (obj: Searches, cb) => {
              if (obj.search === data.getSearches.searches[0].search) {
                needAppend = false;
                const temp = Object.assign({}, { search: obj.search, count: obj.count + 1, updatedAt: new Date() });
                cb(null, temp);
                return temp;
              }
              cb(null, obj);
              return obj;
            },
            (err, res) => {
              if (err) {
                throw new Error('Err');
              }
              parallel([
                () =>
                  client.cache.writeQuery({
                    query: GET_SEARCHES,
                    data: {
                      getSearches: {
                        searches: needAppend ? [...data.getSearches.searches, ...res] : res,
                      },
                    },
                  }),
                () =>
                  db?.getSearches?.update(1, {
                    data: JSON.stringify({
                      getSearches: {
                        searches: needAppend ? [...data.getSearches.searches, ...res] : res,
                      },
                    }),
                  }),
              ]);
            }
          );
        } else {
          parallel([
            () =>
              client.cache.writeQuery({
                query: GET_SEARCHES,
                data: {
                  getSearches: {
                    searches: [...data.getSearches.searches],
                  },
                },
              }),
            () =>
              db?.getSearches?.add(
                {
                  data: JSON.stringify({
                    getSearches: {
                      searches: [...data.getSearches.searches],
                    },
                  }),
                },
                1
              ),
          ]);
        }
      });
    }).then(noop);
  };

  const [getUserData, { data: userData, loading: userDataLoading, error: userDataError }] = useLazyQuery(
    GET_USER_DATA,
    {
      context: { clientName: 'mongo' },
    }
  );

  const [getUserInfoData, { data: userInfoData, loading: userInfoDataLoading, error: userInfoDataError }] =
    useLazyQuery(GET_USER_INFO_DATA, {
      context: { clientName: 'mongo' },
    });

  const [getUserInfoStarred, { data: userStarred, loading: loadingUserStarred, error: errorUserStarred }] =
    useLazyQuery(GET_USER_STARRED, {
      context: { clientName: 'mongo' },
    });

  const [getSeen, { data: seenData, loading: seenDataLoading, error: seenDataError }] = useLazyQuery(GET_SEEN, {
    context: { clientName: 'mongo' },
  });

  const [getSearches, { data: searchesData, loading: loadingSearchesData, error: errorSearchesData }] = useLazyQuery(
    GET_SEARCHES,
    {
      context: { clientName: 'mongo' },
    }
  );

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
        switch (stateShared.isLoggedIn) {
          case true:
            switch (userDataDexie) {
              case undefined:
                switch (true) {
                  case userData && Object.keys(userData?.getUserData).length > 0:
                    setUserDataDexie({ getUserData: userData?.getUserData });
                    db.getUserData.add({ data: JSON.stringify({ getUserData: userData?.getUserData }) }, 1);
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
                if (Object.keys(userDataDexie).length > 0) {
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
      getUserInfoData: () => {
        pushConsumers(Key.getUserInfoData, path);
        switch (stateShared.isLoggedIn) {
          case true:
            switch (userInfoDataDexie) {
              case undefined:
                switch (true) {
                  case userInfoData && Object.keys(userInfoData?.getUserInfoData).length > 0:
                    setUserInfoDataDexie({ getUserInfoData: userInfoData?.getUserInfoData });
                    db.getUserInfoData.add(
                      {
                        data: JSON.stringify({
                          getUserInfoData: userInfoData?.getUserInfoData,
                        } as GraphQLUserInfoData),
                      },
                      1
                    );
                    return {
                      userInfoData: userInfoData as GraphQLUserInfoData,
                      userInfoDataLoading,
                      userInfoDataError,
                    };
                  default:
                    return {
                      userInfoData: userInfoData as GraphQLUserInfoData,
                      userInfoDataLoading,
                      userInfoDataError,
                    };
                }
              default:
                if (Object.keys(userInfoDataDexie).length > 0) {
                  return {
                    userInfoData: userInfoDataDexie as GraphQLUserInfoData,
                    userInfoDataLoading: false,
                    userInfoDataError: undefined,
                  };
                } else {
                  db?.getUserInfoData?.get(1).then((oldData: any) => {
                    if (oldData?.data) {
                      setUserInfoDataDexie({
                        getUserInfoData: JSON.parse(oldData.data).getUserInfoData,
                      } as GraphQLUserInfoData);
                    } else {
                      getUserInfoData();
                      setUserInfoDataDexie(undefined);
                    }
                  });
                }
            }
            break;
          case false:
            return { userInfoData: userInfoData as GraphQLUserInfoData, userInfoDataLoading, userInfoDataError };
          default:
            return { userInfoData: userInfoData as GraphQLUserInfoData, userInfoDataLoading, userInfoDataError };
        }
        return { userInfoData: userInfoData as GraphQLUserInfoData, userInfoDataLoading, userInfoDataError };
      },
      getUserInfoStarred: () => {
        pushConsumers(Key.getUserInfoStarred, path);
        switch (stateShared.isLoggedIn) {
          case true:
            switch (userStarredDexie) {
              case undefined:
                switch (true) {
                  case userStarred && Object.keys(userStarred?.getUserInfoStarred).length > 0:
                    setUserStarredDexie({ getUserInfoStarred: userStarred?.getUserInfoStarred });
                    db.getUserInfoStarred.add(
                      {
                        data: JSON.stringify({
                          getUserInfoStarred: userStarred?.getUserInfoStarred,
                        } as GraphQLUserStarred),
                      },
                      1
                    );
                    return {
                      userStarred: userStarred as GraphQLUserStarred,
                      loadingUserStarred,
                      errorUserStarred,
                    };
                  default:
                    return {
                      userStarred: userStarred as GraphQLUserStarred,
                      loadingUserStarred,
                      errorUserStarred,
                    };
                }
              default:
                if (Object.keys(userStarredDexie).length > 0) {
                  return {
                    userStarred: userStarredDexie as GraphQLUserStarred,
                    loadingUserStarred: false,
                    errorUserStarred: undefined,
                  };
                } else {
                  db?.getUserInfoStarred?.get(1).then((oldData: any) => {
                    if (oldData?.data) {
                      setUserStarredDexie({
                        getUserInfoStarred: JSON.parse(oldData.data).getUserInfoStarred,
                      } as GraphQLUserStarred);
                    } else {
                      getUserInfoStarred();
                      setUserStarredDexie(undefined);
                    }
                  });
                }
            }
            break;
          case false:
            return { userStarred: userStarred as GraphQLUserStarred, loadingUserStarred, errorUserStarred };
          default:
            return { userStarred: userStarred as GraphQLUserStarred, loadingUserStarred, errorUserStarred };
        }
        return { userStarred: userStarred as GraphQLUserStarred, loadingUserStarred, errorUserStarred };
      },
      getSeen: () => {
        pushConsumers(Key.getSeen, path);
        switch (stateShared.isLoggedIn) {
          case true:
            switch (searchesDataDexie) {
              case undefined:
                switch (true) {
                  case seenData && Object.keys(seenData?.getSeen).length > 0:
                    setSeenDataDexie({ getSeen: seenData?.getSeen });
                    db.getSeen.add({ data: JSON.stringify({ getSeen: seenData?.getSeen } as GraphQLSeenData) }, 1);
                    return {
                      seenData: seenData as GraphQLSeenData,
                      seenDataLoading,
                      seenDataError,
                    };
                  default:
                    return {
                      seenData: seenData as GraphQLSeenData,
                      seenDataLoading,
                      seenDataError,
                    };
                }
              default:
                if (Object.keys(seenDataDexie).length > 0) {
                  return {
                    seenData: seenDataDexie as GraphQLSeenData,
                    seenDataLoading: false,
                    seenDataError: undefined,
                  };
                } else {
                  db?.getSeen?.get(1).then((oldData: any) => {
                    if (oldData?.data) {
                      setSeenDataDexie({
                        getSeen: JSON.parse(oldData.data).getSeen,
                      } as GraphQLSeenData);
                    } else {
                      getSeen();
                      setSeenDataDexie(undefined);
                    }
                  });
                }
            }
            break;
          case false:
            return { seenData: seenData as GraphQLSeenData, seenDataLoading, seenDataError };
          default:
            return { seenData: seenData as GraphQLSeenData, seenDataLoading, seenDataError };
        }
        return { seenData: seenData as GraphQLSeenData, seenDataLoading, seenDataError };
      },
      getSearches: () => {
        pushConsumers(Key.getSearches, path);
        switch (stateShared.isLoggedIn) {
          case true:
            switch (searchesDataDexie) {
              case undefined:
                switch (true) {
                  case searchesData && Object.keys(searchesData?.getSearches).length > 0:
                    setSearchesDataDexie({ getSearches: searchesData?.getSearches });
                    db.getSearches.add(
                      { data: JSON.stringify({ getSearches: searchesData?.getSearches } as GraphQLSearchesData) },
                      1
                    );
                    return {
                      searchesData: searchesData as GraphQLSearchesData,
                      loadingSearchesData,
                      errorSearchesData,
                    };
                  default:
                    return {
                      searchesData: searchesData as GraphQLSearchesData,
                      loadingSearchesData,
                      errorSearchesData,
                    };
                }
              default:
                if (Object.keys(searchesDataDexie).length > 0) {
                  return {
                    searchesData: searchesDataDexie as GraphQLSearchesData,
                    loadingSearchesData: false,
                    errorSearchesData: undefined,
                  };
                } else {
                  db?.getSearches?.get(1).then((oldData: any) => {
                    if (oldData?.data) {
                      setSearchesDataDexie({
                        getSearches: JSON.parse(oldData.data).getSearches,
                      } as GraphQLSearchesData);
                    } else {
                      getSearches();
                      setSearchesDataDexie(undefined);
                    }
                  });
                }
            }
            break;
          case false:
            return { searchesData: searchesData as GraphQLSearchesData, loadingSearchesData, errorSearchesData };
          default:
            return { searchesData: searchesData as GraphQLSearchesData, loadingSearchesData, errorSearchesData };
        }
        return { searchesData: searchesData as GraphQLSearchesData, loadingSearchesData, errorSearchesData };
      },
    },
  };
};
