import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import { applyEncryptionMiddleware, ENCRYPT_LIST, clearAllTables } from 'dexie-encrypted';
import { ApolloCacheDB } from './db';
import { readEnvironmentVariable } from '../util';
import Encryption from './Encryption';
import Dexie from 'dexie';
import { noop } from '../util/util';
import { useTrackedStateShared } from '../selectors/stateContextSelector';
import { createStore } from '../util/hooksy';
import {
  GraphQLSearchesData,
  GraphQLSeenData,
  GraphQLUserData,
  GraphQLUserInfoData,
  GraphQLUserStarred,
} from '../typing/interface';

const defaultUserData: GraphQLUserData | any = {};
const defaultUserInfoData: GraphQLUserInfoData | any = {};
const defaultUserStarred: GraphQLUserStarred | any = {};
const defaultSeenData: GraphQLSeenData | any = {};
const defaultSearchesData: GraphQLSearchesData | any = {};
export const [useUserDataDexie] = createStore(defaultUserData);
export const [useUserInfoDataDexie] = createStore(defaultUserInfoData);
export const [useUserStarredDexie] = createStore(defaultUserStarred);
export const [useSeenDataDexie] = createStore(defaultSeenData);
export const [useSearchesDataDexie] = createStore(defaultSearchesData);

const DbCtx = createContainer(() => {
  const [, setUserDataDexie] = useUserDataDexie();
  const [, setUserInfoDataDexie] = useUserInfoDataDexie();
  const [, setUserStarredDexie] = useUserStarredDexie();
  const [, setSeenDataDexie] = useSeenDataDexie();
  const [, setSearchesDataDexie] = useSearchesDataDexie();

  const [db, setDb] = useState<ApolloCacheDB | null>(null);
  const [stateShared] = useTrackedStateShared();
  const conn = new ApolloCacheDB();
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
        getSearchesData: {
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
    let isFinished = false;
    if (!isFinished && stateShared.isLoggedIn) {
      handleOpenDb().then(() => {
        conn.getUserInfoData.get(1).then((data: any) => {
          if (data) {
            setUserInfoDataDexie({ getUserInfoData: JSON.parse(data.data).userInfoData.getUserInfoData });
          }
        });
        conn.getUserInfoStarred.get(1).then((data: any) => {
          if (data) {
            setUserStarredDexie({ getUserInfoStarred: JSON.parse(data.data).userStarred.getUserInfoStarred });
          }
        });
        conn.getSeen.get(1).then((data: any) => {
          if (data) {
            setSeenDataDexie({ getSeen: JSON.parse(data.data).seenData.getSeen });
          }
        });
        conn.getSearchesData.get(1).then((data: any) => {
          if (data) {
            setSearchesDataDexie({ getSearches: JSON.parse(data.data).searchesData.getSearches });
          }
        });
        conn.getUserData.get(1).then((data: any) => {
          if (data) {
            setUserDataDexie({ getUserData: JSON.parse(data.data).userData.getUserData });
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
