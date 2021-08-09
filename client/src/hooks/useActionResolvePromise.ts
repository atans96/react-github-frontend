import { ActionResolvePromise, IDataOne } from '../typing/interface';
import { fastFilter, useStableCallback } from '../util';
import { LanguagePreference, MergedDataProps } from '../typing/type';
import { filterActionResolvedPromiseData, noop } from '../util/util';
import React from 'react';
import { useTrackedState, useTrackedStateDiscover, useTrackedStateShared } from '../selectors/stateContextSelector';
import { useApolloFactory } from './useApolloFactory';
import { alreadySeenCardSelector } from '../selectors/stateSelector';
import { useIsFetchFinish, useIsLoading, useNotification } from '../Home';

const useActionResolvePromise = () => {
  const [, setNotification] = useNotification();
  const [, setIsFetchFinish] = useIsFetchFinish();
  const [, setIsLoading] = useIsLoading();

  const [stateShared] = useTrackedStateShared();
  const [, dispatchDiscover] = useTrackedStateDiscover();
  const [state, dispatch] = useTrackedState();
  const { seenData } = useApolloFactory(Function.name).query.getSeen();
  const { userStarred, loadingUserStarred, errorUserStarred } = useApolloFactory(
    Function.name
  ).query.getUserInfoStarred();
  const { seenDataLoading, seenDataError } = useApolloFactory(Function.name).query.getSeen();
  const { userData } = useApolloFactory(Function.name).query.getUserData();
  const languagePreference = React.useMemo(() => {
    return new Map(
      userData?.getUserData?.languagePreference.map((obj: LanguagePreference) => [obj.language, obj]) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.getUserData?.languagePreference]);
  const alreadySeenCards: number[] = React.useMemo(() => {
    //Every time Global re-renders and nothing is memoized because each render re creates the selector.
    // To solve this we can use React.useMemo. Here is the correct way to use createSelectItemById.
    return alreadySeenCardSelector(seenData?.getSeen?.seenCards ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seenData?.getSeen?.seenCards]);
  const actionAppend = (data: IDataOne | any, displayName: string) => {
    if (state.filterBySeen && !loadingUserStarred && !seenDataLoading && !errorUserStarred && !seenDataError) {
      return new Promise(function (resolve, reject) {
        switch (displayName) {
          case displayName.match(/^discover/gi) && displayName!.match(/^discover/gi)![0].length > 0
            ? displayName
            : undefined: {
            let filter1 = fastFilter(
              (obj: MergedDataProps) =>
                filterActionResolvedPromiseData(
                  obj,
                  !alreadySeenCards?.includes(obj.id) && !userStarred?.getUserInfoStarred?.starred?.includes(obj.id),
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
                  !alreadySeenCards?.includes(obj.id),
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
      if (!loadingUserStarred && !errorUserStarred && !seenDataLoading && !seenDataError) {
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
    }
  );
  return { actionResolvePromise };
};
export default useActionResolvePromise;
