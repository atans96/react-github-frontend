import { useEffect, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { applyEncryptionMiddleware, clearAllTables, ENCRYPT_LIST } from 'dexie-encrypted';
import { ApolloCacheDB } from './db';
import { readEnvironmentVariable } from '../util';
import Encryption from './Encryption';
import Dexie from 'dexie';
import { useTrackedStateShared } from '../selectors/stateContextSelector';
import { useLazyQuery } from '@apollo/client';
import { GET_SEARCHES, GET_USER_DATA } from '../graphql/queries';
import { parallel } from 'async';
import { createStore } from '../util/hooksy';

const conn = new ApolloCacheDB();
const defaultDexieDB: ApolloCacheDB | any = null;
export const [useDexieDB] = createStore(defaultDexieDB);

const DbCtx = createContainer(() => {
  const [getSearches, { data: searchesData, loading: loadingSearchesData, error: errorSearchesData }] = useLazyQuery(
    GET_SEARCHES,
    {
      context: { clientName: 'mongo' },
    }
  );

  const [getUserData, { data: userData, loading: userDataLoading, error: userDataError }] = useLazyQuery(
    GET_USER_DATA,
    {
      context: { clientName: 'mongo' },
    }
  );
  const isFinished = useRef(false);
  const [db, setDb] = useDexieDB();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const handleOpenDb = async () => {
    let symmetricKey;
    if (await Dexie.exists('ApolloCacheDB')) {
      try {
        symmetricKey = await Encryption.decryptKey(readEnvironmentVariable('DB_KEY')!);
      } catch (error) {
        throw new Error(error);
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
        getClicked: {
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
    return () => {
      isFinished.current = true;
    };
  }, []);

  useEffect(() => {
    if (
      !isFinished.current &&
      !userDataLoading &&
      !userDataError &&
      userData?.getUserData &&
      Object.keys(userData?.getUserData).length > 0
    ) {
      db?.getUserData?.add(
        {
          data: JSON.stringify({
            getUserData: {
              ...userData?.getUserData,
            },
          }),
        },
        1
      );
      dispatchShared({
        type: 'SET_USERDATA',
        payload: {
          userData: userData?.getUserData,
        },
      });
    }
  }, [userDataLoading, userDataError]);

  useEffect(() => {
    if (
      !isFinished.current &&
      !loadingSearchesData &&
      !errorSearchesData &&
      searchesData?.getSearches?.searches?.length > 0
    ) {
      db?.getSearches?.add(
        {
          data: JSON.stringify({
            getSearches: {
              searches: searchesData.getSearches.searches,
            },
          }),
        },
        1
      );
      dispatchShared({
        type: 'SET_SEARCHES_HISTORY',
        payload: {
          searches: searchesData.getSearches.searches,
        },
      });
    }
  }, [loadingSearchesData, errorSearchesData]);

  useEffect(() => {
    if (!isFinished.current && stateShared.isLoggedIn) {
      handleOpenDb().then(() => {
        parallel([
          () =>
            conn.getUserData.get(1).then((data: any) => {
              if (data && data?.data) {
                const temp = JSON.parse(data.data).getUserData;
                if (Object.keys(temp).length > 0 && !isFinished.current) {
                  dispatchShared({
                    type: 'SET_USERDATA',
                    payload: {
                      userData: temp,
                    },
                  });
                }
              } else {
                getUserData();
              }
            }),
          () =>
            conn.getSearches.get(1).then((data: any) => {
              if (data && data?.data) {
                const temp = JSON.parse(data.data).getSearches;
                if (temp.searches.length > 0 && !isFinished.current) {
                  dispatchShared({
                    type: 'SET_SEARCHES_HISTORY',
                    payload: {
                      searches: temp.searches,
                    },
                  });
                }
              } else {
                getSearches();
              }
            }),
        ]);
      }); // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [stateShared.isLoggedIn]);

  // avoid ts async
  return {
    db: db as ApolloCacheDB,
    clear: () => indexedDB.deleteDatabase('ApolloCacheDB'),
  };
});

export default DbCtx;
