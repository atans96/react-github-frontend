import React, { useEffect, useRef, useState } from 'react';
import { verifyJWTToken } from '../services';
import CryptoJS from 'crypto-js';
import { readEnvironmentVariable } from '../util';
import { logoutAction } from '../util/util';
import { useApolloFactory } from './useApolloFactory';
import { useHistory } from 'react-router-dom';
import { IAction } from '../typing/interface';
import { ActionShared } from '../store/Shared/reducer';

interface ComponentProps {
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
}

interface useUserVerificationProps {
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
}

function useUserVerification(dispatchShared: React.Dispatch<IAction<ActionShared>>) {
  const history = useHistory();
  const [username, setUsername] = useState<any>(undefined);
  const { userDataLoading } = useApolloFactory(Function.name).query.getUserData();
  const isMounted = useRef(false); //when the first time is mounted, that means the user hasn't queried anything yet so
  //if the token is expired, logout. Else, when already mounted but token not expired, we prolong the token.
  useEffect(() => {
    (async function () {
      if (typeof localStorage.getItem('jbb') === 'string' && typeof localStorage.getItem('sess') === 'string') {
        try {
          const response = await verifyJWTToken(
            localStorage.getItem('sess')!,
            CryptoJS.TripleDES.decrypt(
              localStorage.getItem('jbb') || '',
              readEnvironmentVariable('CRYPTO_SECRET')!
            ).toString(CryptoJS.enc.Latin1),
            isMounted.current
          );
          if (response.valid) {
            setUsername(response.username);
            localStorage.setItem('sess', response.token);
          } else {
            logoutAction(history, dispatchShared);
          }
        } catch (e) {
          logoutAction(history, dispatchShared);
          console.error(e);
        }
        isMounted.current = true;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return {
    verifiedLoading: userDataLoading,
    username:
      username === undefined || localStorage.getItem('jbb') === null || localStorage.getItem('sess') === null
        ? ''
        : username,
  };
}

export default useUserVerification;
