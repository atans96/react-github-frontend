import { getSearchTopics, getUser } from '../services';
import { IDataOne } from '../typing/interface';
import { ActionResolvedPromise, MergedDataProps } from '../typing/type';
import { noop } from '../util/util';
import { useRef, useState } from 'react';
import { useTrackedState, useTrackedStateShared, useTrackedStateStargazers } from '../selectors/stateContextSelector';
import { useStableCallback } from '../util';
import useActionResolvePromise from './useActionResolvePromise';
import { useIsFetchFinish, useIsLoading, useNotification } from '../Home';

interface useFetchUser {
  component: string;
  abortController: any;
}

//TO extract all JSON field
const regex = new RegExp(
  /(?:\"|\')(?<key>[^"]*)(?:\"|\')(?=:)(?:\:\s*)(?:\"|\')?(?<value>true|false|https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)|[0-9a-zA-Z\+\-\,\.\\/$]*)/gim
);
//To extract all json objects
const regexJSON = new RegExp(/\{(?:[^{}]|(\{(?:[^{}]|(\{[^{}]*\}))*\}))*\}/, 'g');
const useFetchUser = ({ component, abortController }: useFetchUser) => {
  const [, setNotification] = useNotification();
  const [isFetchFinish, setIsFetchFinish] = useIsFetchFinish();
  const [, setLoading] = useIsLoading();

  const { actionResolvePromise } = useActionResolvePromise();
  const axiosCancel = useRef<boolean>(false);
  const [state, dispatch] = useTrackedState();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [, dispatchStargazers] = useTrackedStateStargazers();
  // useState is used when the HTML depends on it directly to render something
  const [clickedGQLTopic, setGQLTopic] = useState({
    variables: '',
  } as any);
  // useRef will assign a reference for each component, while a variable defined outside a function component will only be called once.
  // so don't use let page=1 outside of Home component. useRef makes sure same reference is returned during each render while it won't cause re-render
  // https://stackoverflow.com/questions/57444154/why-need-useref-to-contain-mutable-variable-but-not-define-variable-outside-the
  const onClickTopic = useStableCallback(async ({ variables }: any) => {
    if (abortController.signal.aborted) return;
    if (stateShared.tokenGQL !== '' && state.filterBySeen) {
      setLoading({ isLoading: true });
      dispatch({
        type: 'REMOVE_ALL',
      });
      dispatchStargazers({
        type: 'REMOVE_ALL',
      });
      dispatchShared({
        type: 'QUERY_USERNAME',
        payload: {
          queryUsername: '',
        },
      });
      setIsFetchFinish({ isFetchFinish: false });
      setNotification({ notification: '' });
      setGQLTopic({
        variables,
      });
      let paginationInfo = 0;
      return getSearchTopics({
        signal: abortController.signal,
        topic: variables.queryTopic,
        axiosCancel: axiosCancel.current,
      })
        .then((result) => {
          if (abortController.signal.aborted) return;
          if (result) {
            paginationInfo += result.paginationInfoData;
            actionController(result);
          }
        })
        .catch((error) => {
          actionResolvePromise({
            username: stateShared.queryUsername,
            action: ActionResolvedPromise.error,
            displayName: component,
            error,
          });
        });
    }
  });
  const actionController = (res: IDataOne) => {
    // compare new with old data, if they differ, that means it still has data to fetch
    if (res.dataOne.length > 0) {
      actionResolvePromise({
        username: stateShared.queryUsername,
        action: ActionResolvedPromise.append,
        displayName: component,
        data: res,
      });
    } else if (res?.error_404 || res?.error_403 || res?.error_message) {
      actionResolvePromise({
        username: stateShared.queryUsername,
        action: ActionResolvedPromise.error,
        displayName: component,
        data: res,
      });
    } else if (res?.end) {
      actionResolvePromise({
        username: stateShared.queryUsername,
        action: ActionResolvedPromise.end,
        displayName: component,
        data: res,
      });
    } else {
      actionResolvePromise({
        username: stateShared.queryUsername,
        action: ActionResolvedPromise.noData,
        displayName: component,
        data: res,
      });
    }
    return false;
  };
  const fetchUser = () => {
    if (!isFetchFinish.isFetchFinish) {
      setLoading({ isLoading: true });
      setNotification({ notification: '' });
      let userNameTransformed: string[];
      if (!Array.isArray(stateShared.queryUsername)) {
        userNameTransformed = [stateShared.queryUsername];
      } else {
        userNameTransformed = stateShared.queryUsername;
      }
      const mainIter = async ({ value, actionController }: { value: any; actionController: any }) => {
        let dataOne: {
          dataOne: MergedDataProps[];
          error_404: boolean;
          error_403: boolean;
          end: boolean;
          error_message: string | undefined;
        } = {
          dataOne: [],
          error_404: false,
          error_403: false,
          end: false,
          error_message: undefined,
        };
        let chunk = '';
        for await (const data of value()) {
          let array1;
          chunk += new TextDecoder().decode(data);
          while ((array1 = regexJSON.exec(chunk)) !== undefined) {
            try {
              const data = JSON.parse(array1![0]);
              if (data.id && data.full_name && data.default_branch) {
                dataOne.dataOne.push(data);
              } else if (data.message && data.message.toString().toLowerCase().includes('not found')) {
                dataOne.error_404 = true;
                return actionController(dataOne);
              } else if (data.message && data.message.toString().toLowerCase().includes('api')) {
                dataOne.error_403 = true;
                return actionController(dataOne);
              } else {
                dataOne.error_message = data.message;
                return actionController(dataOne);
              }
            } catch (e) {
              break;
            }
          }
          //When the regex is global, if you call a method on the same regex object,
          // it will start from the index past the end of the last match. so we need to reset it to start the new loop
          regexJSON.lastIndex = 0;
          if (dataOne.dataOne.length > 0) return actionController(dataOne);
          if (chunk === '[\n\n]\n') {
            dataOne.end = true;
            return actionController(dataOne);
          }
        }
        return state.mergedData.length === 0 && dataOne.dataOne.length === 0;
      };
      let fetcher = (name: string, org: boolean) =>
        getUser({
          signal: abortController.signal,
          username: name,
          perPage: stateShared.perPage,
          page: state.page,
          org,
        });
      let observer: undefined | any;
      userNameTransformed.forEach((name) => {
        const execute = async () => {
          observer = !observer ? fetcher(name, false) : observer;
          observer.subscribe({
            async next(value: { iterator: any }) {
              if (value.iterator) {
                try {
                  const shouldFetchOrg = await mainIter({ value: value.iterator, actionController });
                  if (shouldFetchOrg) {
                    observer = fetcher(name, true);
                    execute().then(noop);
                  }
                } catch (e) {
                  throw new Error(e.message);
                }
              } else {
                throw new Error('no value iterator');
              }
            },
            error(err: any) {
              actionResolvePromise({
                username: stateShared.queryUsername,
                action: ActionResolvedPromise.error,
                displayName: component,
                err,
              });
            },
            complete() {},
          });
        };
        execute().then(noop);
      });
    }
  };
  const fetchTopics = () => {
    // we want to preserve state.page so that when the user navigate away from Home, then go back again, we still want to retain state.page
    // so when they scroll again, it will fetch the correct next page. However, as the user already scroll, it causes state.page > 1
    // thus when they navigate away and go back again to Home, this will hit again, thus causing re-fetching the same data.
    // to prevent that, we need to reset the Home.js is unmounted.
    if (!isFetchFinish.isFetchFinish) {
      // it's possible the user click Details.js and go back to Home.js again and find out that
      // that the previous page.current is already 2, but when he/she navigates aways from Home.js, it go back to page.current=1 again
      // so the scroll won't get fetch immediately. Thus, we need to persist state.page using reducer
      setLoading({ isLoading: true }); // spawn loading spinner at bottom page
      setNotification({ notification: '' });
      if (clickedGQLTopic.queryTopic !== undefined) {
        getSearchTopics({
          signal: abortController.signal,
          topic: clickedGQLTopic.queryTopic,
          axiosCancel: axiosCancel.current,
        })
          .then((res) => {
            if (res) actionController(res);
          })
          .catch((error) => {
            actionResolvePromise({
              username: stateShared.queryUsername,
              action: ActionResolvedPromise.error,
              error: error,
              displayName: component,
            });
          });
      }
    }
  };
  return {
    fetchTopics,
    fetchUser,
    onClickTopic,
    clickedGQLTopic,
  };
};
export default useFetchUser;
