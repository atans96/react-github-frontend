import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import { applyEncryptionMiddleware, clearAllTables, ENCRYPT_LIST } from 'dexie-encrypted';
import { ApolloCacheDB } from './db';
import { readEnvironmentVariable } from '../util';
import Encryption from './Encryption';
import Dexie from 'dexie';
import { useTrackedState, useTrackedStateShared } from '../selectors/stateContextSelector';
import { createStore } from '../util/hooksy';
import { GraphQLRSSFeedData, GraphQLUserInfoData } from '../typing/interface';
import { SeenProps } from '../typing/type';
import { useLazyQuery } from '@apollo/client';
import { GET_SEARCHES, GET_SEEN, GET_USER_STARRED } from '../graphql/queries';
import { parallel } from 'async';

const conn = new ApolloCacheDB();

const defaultUserInfoData: GraphQLUserInfoData | any = {};
const defaultRSSFeed: GraphQLRSSFeedData | any = {};
export const [useRSSFeedDexie] = createStore(defaultRSSFeed);
export const [useUserInfoDataDexie] = createStore(defaultUserInfoData);

const DbCtx = createContainer(() => {
  const [getSeen, { data: seenData, loading: seenDataLoading, error: seenDataError }] = useLazyQuery(GET_SEEN, {
    context: { clientName: 'mongo' },
  });

  const [getUserInfoStarred, { data: userStarred, loading: loadingUserStarred, error: errorUserStarred }] =
    useLazyQuery(GET_USER_STARRED, {
      context: { clientName: 'mongo' },
    });

  const [getSearches, { data: searchesData, loading: loadingSearchesData, error: errorSearchesData }] = useLazyQuery(
    GET_SEARCHES,
    {
      context: { clientName: 'mongo' },
    }
  );

  const [, setRSSFeedDexie] = useRSSFeedDexie();
  const [, setUserInfoDataDexie] = useUserInfoDataDexie();

  const [db, setDb] = useState<ApolloCacheDB | null>(null);
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [, dispatch] = useTrackedState();

  const handleOpenDb = async () => {
    let symmetricKey;
    if (await Dexie.exists('ApolloCacheDB')) {
      try {
        symmetricKey = await Encryption.decryptKey(readEnvironmentVariable('DB_KEY')!);
      } catch (error) {
        throw new Error('Password is not correct');
      }
    } else {
      // generate a random key to encrypt DB then encrypt the key with the user password
      // we do this in case the user changes the password so we don't have to re-encrypt the whole db
      symmetricKey = await Encryption.generateRandomKeyBuffer();

      // encrypt the symmetric key with the password
      await Encryption.encryptKey(symmetricKey, readEnvironmentVariable('DB_KEY')!);
    }

    applyEncryptionMiddleware(
      conn,
      symmetricKey,
      {
        getUserData: {
          type: ENCRYPT_LIST,
          fields: ['data'],
        },
        getUserInfoData: {
          type: ENCRYPT_LIST,
          fields: ['data'],
        },
        getUserInfoStarred: {
          type: ENCRYPT_LIST,
          fields: ['data'],
        },
        getSeen: {
          type: ENCRYPT_LIST,
          fields: ['data'],
        },
        getSearches: {
          type: ENCRYPT_LIST,
          fields: ['data'],
        },
      },
      async (db) => clearAllTables(db)
    );
    // Dexie does not wait for all hooks to be subscribed (bug?).
    await conn.open();
    setDb(conn);
  };

  useEffect(() => {
    if (!loadingSearchesData && !errorSearchesData && searchesData?.getSearches?.searches?.length > 0) {
      dispatchShared({
        type: 'SET_SEARCHES_HISTORY',
        payload: {
          searches: searchesData.getSearches.searches,
        },
      });
    }
  }, [loadingSearchesData, errorSearchesData]);

  useEffect(() => {
    if (!loadingUserStarred && !errorUserStarred && userStarred?.getUserInfoStarred?.starred?.length > 0) {
      dispatchShared({
        type: 'SET_STARRED',
        payload: {
          starred: userStarred.getUserInfoStarred.starred,
        },
      });
    }
  }, [loadingUserStarred, errorUserStarred]);

  useEffect(() => {
    if (!seenDataLoading && !seenDataError && seenData?.getSeen?.seenCards?.length > 0) {
      dispatchShared({
        type: 'SET_SEEN',
        payload: {
          seenCards: seenData?.getSeen?.seenCards?.reduce((acc: any[], obj: SeenProps) => {
            acc.push(obj.id);
            return acc;
          }, []),
        },
      });
      dispatch({
        type: 'UNDISPLAY_MERGED_DATA',
        payload: {
          undisplayMergedData: seenData?.getSeen?.seenCards,
        },
      });
    }
  }, [seenDataLoading, seenDataError]);

  useEffect(() => {
    let isFinished = false;
    if (!isFinished && stateShared.isLoggedIn) {
      handleOpenDb().then(() => {
        conn.getSearches.get(1).then((data: any) => {
          if (data) {
            const temp = JSON.parse(data.data).getSearches;
            if (temp.searches.length > 0) {
              parallel([
                () =>
                  dispatchShared({
                    type: 'SET_SEARCHES_HISTORY',
                    payload: {
                      searches: temp.searches,
                    },
                  }),
              ]);
            }
          } else {
            getSearches();
          }
        });
        conn.getUserInfoStarred.get(1).then((data: any) => {
          if (data) {
            const temp = JSON.parse(data.data).getUserInfoStarred;
            if (temp.starred.length > 0) {
              parallel([
                () =>
                  dispatchShared({
                    type: 'SET_STARRED',
                    payload: {
                      starred: temp.starred,
                    },
                  }),
              ]);
            }
          } else {
            getUserInfoStarred();
          }
        });
        conn.getSeen.get(1).then((data: any) => {
          if (data) {
            const temp = JSON.parse(data.data).getSeen;
            if (temp.seenCards.length > 0) {
              parallel([
                () =>
                  dispatchShared({
                    type: 'SET_SEEN',
                    payload: {
                      seenCards: temp.seenCards.reduce((acc: any[], obj: SeenProps) => {
                        acc.push(obj.id);
                        return acc;
                      }, []),
                    },
                  }),
                () =>
                  dispatch({
                    type: 'UNDISPLAY_MERGED_DATA',
                    payload: {
                      undisplayMergedData: temp.seenCards,
                    },
                  }),
              ]);
            }
          } else {
            getSeen();
          }
        });
        conn.getUserInfoData.get(1).then((data: any) => {
          if (data) {
            const temp = JSON.parse(data.data).getUserInfoData;
            if (temp) {
              setUserInfoDataDexie({ getUserInfoData: temp });
            }
          }
        });
      }); // eslint-disable-next-line react-hooks/exhaustive-deps
    }
    return () => {
      isFinished = true;
    };
  }, [stateShared.isLoggedIn]);

  // avoid ts async
  return {
    db: db as ApolloCacheDB,
    clear: () => indexedDB.deleteDatabase('ApolloCacheDB'),
  };
});

export default DbCtx;
