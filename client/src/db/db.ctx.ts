import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import { applyEncryptionMiddleware, ENCRYPT_LIST } from 'dexie-encrypted';
import { ApolloCacheDB } from './db';
import { readEnvironmentVariable } from '../util';

const DbCtx = createContainer(() => {
  const [db, setDb] = useState<ApolloCacheDB | null>(null);

  const handleOpenDb = () => {
    const conn = new ApolloCacheDB();

    // https://tweetnacl.js.org/#/secretbox
    const key = readEnvironmentVariable('DB_KEY');
    const binary_string = atob(key!);
    const binLength = binary_string.length;
    const cryptoKey = new Uint8Array(binLength);
    for (let i = 0; i < binLength; i += 1) {
      cryptoKey[i] = binary_string.charCodeAt(i);
    }

    applyEncryptionMiddleware(
      conn,
      cryptoKey,
      {
        apolloCache: {
          type: ENCRYPT_LIST,
          fields: ['data'],
        },
      },
      async (key) => console.log(`DB_KEY has been changed with ${key}`)
    );

    conn.open();
    setDb(conn);
  };

  useEffect(() => {
    handleOpenDb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // avoid ts async
  return { db: db as ApolloCacheDB };
});

export default DbCtx;
