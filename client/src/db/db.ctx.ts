import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import { applyEncryptionMiddleware, ENCRYPT_LIST, clearAllTables } from 'dexie-encrypted';
import { ApolloCacheDB } from './db';
import { readEnvironmentVariable } from '../util';
import Encryption from './Encryption';
import Dexie from 'dexie';
import { useTrackedStateShared } from '../selectors/stateContextSelector';

const conn = new ApolloCacheDB();

const DbCtx = createContainer(() => {
  const [db, setDb] = useState<ApolloCacheDB | null>(null);
  const [stateShared] = useTrackedStateShared();
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
    let isFinished = false;
    if (!isFinished && stateShared.isLoggedIn) {
      handleOpenDb().then(() => {}); // eslint-disable-next-line react-hooks/exhaustive-deps
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
