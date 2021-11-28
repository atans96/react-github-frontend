import { ActionResolvePromise, IDataOne } from '../typing/interface';
import { useStableCallback } from '../util';
import { LanguagePreference, MergedDataProps } from '../typing/type';
import { noop } from '../util/util';
import React from 'react';
import { useTrackedState, useTrackedStateDiscover, useTrackedStateShared } from '../selectors/stateContextSelector';
import { useIsFetchFinish, useIsLoading, useNotification } from '../components/Home';
import { useLocation } from 'react-router-dom';

const useActionResolvePromise = () => {
  const [, setNotification] = useNotification();
  const [, setIsFetchFinish] = useIsFetchFinish();
  const [, setIsLoading] = useIsLoading();
  const location = useLocation();

  const [stateShared] = useTrackedStateShared();
  const [, dispatchDiscover] = useTrackedStateDiscover();
  const [state, dispatch] = useTrackedState();
  const languagePreference = React.useMemo(() => {
    return new Map(
      (stateShared?.userData?.languagePreference &&
        stateShared.userData.languagePreference.map((obj: LanguagePreference) => [obj.language, obj])) ||
        []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateShared?.userData?.languagePreference]);

  const actionAppend = (data: IDataOne | any) => {
    if (state.filterBySeen) {
      return new Promise(function (resolve, reject) {
        switch (location.pathname) {
          case '/discover': {
            let res = [];
            for (let i = 0; i < data.length; i++) {
              if (
                languagePreference?.get(data[i].language)?.checked &&
                !stateShared?.seenCards.has(data[i].id) &&
                !stateShared?.clicked.has(data[i].full_name) &&
                !stateShared?.starred?.includes(data[i].full_name)
              ) {
                res.push(data[i]);
              }
            }
            if (res.length > 0) {
              dispatchDiscover({
                type: 'MERGED_DATA_APPEND_DISCOVER',
                payload: {
                  data: res,
                },
              });
            } else if (res.length === 0) {
              dispatchDiscover({
                type: 'ADVANCE_PAGE_DISCOVER',
              });
            }
            resolve();
            break;
          }
          default: {
            let res = [];
            if (stateShared.isLoggedIn) {
              for (let i = 0; i < data.dataOne.length; i++) {
                if (
                  languagePreference?.get(data.dataOne[i].language)?.checked &&
                  !stateShared?.seenCards?.has(data.dataOne[i].id) &&
                  !stateShared?.clicked?.has(data.dataOne[i].full_name)
                ) {
                  res.push(data.dataOne[i]);
                }
              }
            } else {
              res = [...data.dataOne];
            }
            if (res.length === 0) {
              dispatch({
                type: 'ADVANCE_PAGE',
              });
            } else {
              res.map((obj: MergedDataProps) => {
                obj['isQueue'] = false;
                return obj;
              });
              dispatch({
                type: 'MERGED_DATA_ADDED',
                payload: {
                  data: res,
                },
              });
              // dispatch({
              //   type: 'MERGED_DATA_APPEND',
              //   payload: {
              //     data: res,
              //   },
              // });
            }
            resolve();
            break;
          }
        }
      });
    }
  };

  const actionResolvePromise = useStableCallback(
    ({ action, username, data = undefined, displayName, error = undefined }: ActionResolvePromise) => {
      if (data && action === 'append') {
        actionAppend(data)!.then(noop);
        setIsLoading({ isLoading: false });
      }
      if (action === 'noData') {
        setIsLoading({ isLoading: false });
        setIsFetchFinish({ isFetchFinish: true });
        if (username.length > 2) {
          setNotification({ notification: 'Sorry, no more data found' });
        } else {
          setNotification({ notification: `Sorry, no more data found for: "${username[0]}"` });
        }
      }
      if (action === 'end') {
        setIsLoading({ isLoading: false });
        setIsFetchFinish({ isFetchFinish: true });
        if (username.length > 2) {
          setNotification({ notification: "That's all the data we get" });
        } else {
          setNotification({ notification: `That's all the data we get for: "${username[0]}"` });
        }
      }
      if (action === 'error' && error) {
        setIsLoading({ isLoading: false });
        throw new Error(`Something wrong at ${displayName} ${error}`);
      }
      if (data && data.error_404) {
        setIsLoading({ isLoading: false });
        setNotification({ notification: `Sorry, no data found for ${username}` });
      } else if (data && data.error_403) {
        setIsLoading({ isLoading: false });
        setIsFetchFinish({ isFetchFinish: true });
        setNotification({ notification: 'Sorry, API rate limit exceeded.' });
      } else if (data && data.error_message) {
        setIsLoading({ isLoading: false });
        setIsFetchFinish({ isFetchFinish: true });
        setNotification({ notification: `${data.error_message}` });
      }
    }
  );
  return { actionResolvePromise };
};
export default useActionResolvePromise;
