import { ActionResolvePromise, IDataOne } from '../typing/interface';
import { fastFilter, useStableCallback } from '../util';
import { Clicked, LanguagePreference, MergedDataProps } from '../typing/type';
import { filterActionResolvedPromiseData, noop } from '../util/util';
import React from 'react';
import { useTrackedState, useTrackedStateDiscover, useTrackedStateShared } from '../selectors/stateContextSelector';
import { useIsFetchFinish, useIsLoading, useNotification } from '../Home';

const useActionResolvePromise = () => {
  const [, setNotification] = useNotification();
  const [, setIsFetchFinish] = useIsFetchFinish();
  const [, setIsLoading] = useIsLoading();

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

  const actionAppend = (data: IDataOne | any, displayName: string) => {
    if (state.filterBySeen) {
      return new Promise(function (resolve, reject) {
        switch (displayName) {
          case displayName.match(/^discover/gi) && displayName!.match(/^discover/gi)![0].length > 0
            ? displayName
            : undefined: {
            let filter1 = fastFilter(
              (obj: MergedDataProps) =>
                filterActionResolvedPromiseData(
                  obj,
                  !stateShared?.seenCards?.includes(obj.id) &&
                    !stateShared?.starred?.includes(obj.id) &&
                    !stateShared?.clicked?.find((element: Clicked) => element.full_name === obj.full_name),
                  !!languagePreference?.get(obj.language)?.checked
                ),
              data
            );
            if (filter1.length > 0) {
              dispatchDiscover({
                type: 'MERGED_DATA_APPEND_DISCOVER',
                payload: {
                  data: filter1,
                },
              });
            } else if (filter1.length === 0) {
              dispatchDiscover({
                type: 'ADVANCE_PAGE_DISCOVER',
              });
            }
            resolve();
            break;
          }
          case 'Home': {
            const filter1 = fastFilter(
              (obj: MergedDataProps) =>
                filterActionResolvedPromiseData(
                  obj,
                  !stateShared?.seenCards?.includes(obj.id) &&
                    !stateShared?.clicked?.find((element: Clicked) => element.full_name === obj.full_name),
                  !!languagePreference?.get(obj.language)
                ),
              data.dataOne
            );
            dispatch({
              type: 'MERGED_DATA_APPEND',
              payload: {
                data: filter1,
              },
            });
            if (filter1.length === 0) {
              dispatch({
                type: 'ADVANCE_PAGE',
              });
            } else {
              const temp = data.dataOne || data;
              temp.map((obj: MergedDataProps) => {
                obj['isQueue'] = false;
                return obj;
              });
              dispatch({
                type: 'MERGED_DATA_APPEND',
                payload: {
                  data: temp,
                },
              });
            }
            resolve();
            break;
          }
          default: {
            throw new Error('No valid component found!');
          }
        }
      });
    }
  };
  const actionResolvePromise = useStableCallback(
    ({ action, data = undefined, displayName, error = undefined }: ActionResolvePromise) => {
      if (data && action === 'append') {
        setIsLoading({ isLoading: false });
        actionAppend(data, displayName)!.then(noop);
      }
      if (action === 'noData') {
        setIsLoading({ isLoading: false });
        setIsFetchFinish({ isFetchFinish: true });
        if (stateShared.queryUsername.length > 2) {
          setNotification({ notification: 'Sorry, no more data found' });
        } else {
          setNotification({ notification: `Sorry, no more data found for: "${stateShared.queryUsername[0]}"` });
        }
      }
      if (action === 'end') {
        setIsLoading({ isLoading: false });
        setIsFetchFinish({ isFetchFinish: true });
        if (stateShared.queryUsername.length > 2) {
          setNotification({ notification: "That's all the data we get" });
        } else {
          setNotification({ notification: `That's all the data we get for: "${stateShared.queryUsername[0]}"` });
        }
      }
      if (action === 'error' && error) {
        setIsLoading({ isLoading: false });
        throw new Error(`Something wrong at ${displayName} ${error}`);
      }
      if (data && data.error_404) {
        setIsLoading({ isLoading: false });
        setNotification({ notification: `Sorry, no data found for ${stateShared.queryUsername}` });
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
