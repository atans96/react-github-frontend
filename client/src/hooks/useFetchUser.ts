import { getOrg, getSearchTopics, getUser } from '../services';
import { IDataOne } from '../typing/interface';
import { ActionResolvedPromise, MergedDataProps, Nullable } from '../typing/type';
import { noop } from '../util/util';
import { useRef, useState } from 'react';
import { useTrackedState, useTrackedStateShared, useTrackedStateStargazers } from '../selectors/stateContextSelector';
import { Counter, useStableCallback } from '../util';
import useActionResolvePromise from './useActionResolvePromise';
import Mutex from '../util/mutex/mutex';
import uniqBy from 'lodash.uniqby';
const mutex = new Mutex();

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
  const { actionResolvePromise } = useActionResolvePromise();
  const axiosCancel = useRef<boolean>(false);
  const [state, dispatch] = useTrackedState();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [, dispatchStargazers] = useTrackedStateStargazers();
  // useState is used when the HTML depends on it directly to render something
  const [isLoading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [clickedGQLTopic, setGQLTopic] = useState({
    variables: '',
  } as any);
  // useRef will assign a reference for each component, while a variable defined outside a function component will only be called once.
  // so don't use let page=1 outside of Home component. useRef makes sure same reference is returned during each render while it won't cause re-render
  // https://stackoverflow.com/questions/57444154/why-need-useref-to-contain-mutable-variable-but-not-define-variable-outside-the
  const isFetchFinish = useRef(false); // indicator to stop fetching when we have no more data
  const onClickTopic = useStableCallback(async ({ variables }: any) => {
    if (stateShared.tokenGQL !== '' && state.filterBySeen) {
      setLoading(true);
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
      isFetchFinish.current = false;
      setNotification('');
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
          if (result) {
            paginationInfo += result.paginationInfoData;
            dispatch({
              type: 'LAST_PAGE',
              payload: {
                lastPage: paginationInfo,
              },
            });
            actionController(result);
          }
        })
        .catch((error) => {
          actionResolvePromise({
            action: ActionResolvedPromise.error,
            setLoading,
            setNotification,
            isFetchFinish: isFetchFinish.current,
            displayName: component,
            error,
          });
        });
    }
  });
  const isDataExists = (data: Nullable<IDataOne>) => {
    if (data === undefined || data?.dataOne === undefined) {
      return [[], []];
    }
    const oldID: number[] = [];
    const newID: number[] = [];
    state.mergedData.map((obj) => {
      return oldID.push(obj.id);
    });
    data.dataOne.map((obj: MergedDataProps) => {
      return newID.push(obj.id);
    });

    return newID.length > 0 && !([...new Set([...oldID, ...newID])].length === oldID.length);
  };
  const isFunction = (value: () => void) =>
    value && (Object.prototype.toString.call(value) === '[object Function]' || 'function' === typeof value || true)
      ? value()
      : new Error('Not valid function!');

  const actionController = (res: IDataOne, callback?: Promise<any> | any) => {
    // compare new with old data, if they differ, that means it still has data to fetch
    const promiseOrNot = () => {
      callback() instanceof Promise && res !== undefined && (res.error_404 || res.error_403)
        ? callback()
        : isFunction(callback);
    };
    if (isDataExists(res)) {
      const ja = Counter(uniqBy([...res.dataOne], 'id'), 'language');
      const repoStat = Object.entries(ja)
        .slice(0, 5)
        .map((arr: any) => {
          const ja = state.repoStat.find((xx) => xx[0] === arr[0]) || [0, 0];
          return [arr[0], ja[1] + arr[1]];
        });
      dispatch({
        type: 'REPO_STAT',
        payload: {
          repoStat: repoStat,
        },
      });
      actionResolvePromise({
        action: ActionResolvedPromise.append,
        setLoading,
        setNotification,
        isFetchFinish: isFetchFinish.current,
        displayName: component,
        data: res,
      });
    } else if (res !== undefined && (res.error_404 || res.error_403)) {
      callback
        ? promiseOrNot()
        : actionResolvePromise({
            action: ActionResolvedPromise.error,
            setLoading,
            setNotification,
            isFetchFinish: isFetchFinish.current,
            displayName: component,
            data: res,
          });
    } else {
      isFetchFinish.current = actionResolvePromise({
        action: ActionResolvedPromise.noData,
        setLoading,
        setNotification,
        isFetchFinish: isFetchFinish.current,
        displayName: component,
        data: res,
      }).isFetchFinish;
    }
    return true;
  };
  function clear(time: number) {
    clearTimeout(time);
  }
  const fetchUser = () => {
    setLoading(true);
    isFetchFinish.current = false;
    setNotification('');
    let userNameTransformed: string[];
    if (!Array.isArray(stateShared.queryUsername)) {
      userNameTransformed = [stateShared.queryUsername];
    } else {
      userNameTransformed = stateShared.queryUsername;
    }
    const mainIter = async ({ value, actionController, cb }: { value: any; actionController: any; cb: any }) => {
      if (value) {
        let dataOne: { dataOne: MergedDataProps[] } = { dataOne: [] };
        let chunk = '';
        let interval: any;
        for await (const data of value()) {
          let array1;
          chunk += new TextDecoder().decode(data);
          while ((array1 = regexJSON.exec(chunk)) !== undefined) {
            try {
              const data = JSON.parse(array1![0]);
              if (data.id && data.full_name && data.default_branch) {
                dataOne.dataOne.push(data);
              }
            } catch (e) {
              break;
            }
          }
          //When the regex is global, if you call a method on the same regex object,
          // it will start from the index past the end of the last match. so we need to reset it to start the new loop
          regexJSON.lastIndex = 0;
          if (!interval) {
            actionController(dataOne, cb);
          }
          const release = await mutex.acquire();
          interval = setTimeout(() => {
            if (dataOne.dataOne.length > 0) actionController(dataOne, cb);
            release();
            clear(interval);
          }, 3000);
        }
      }
    };
    userNameTransformed.forEach((name) => {
      const observer = getUser({
        signal: abortController.signal,
        username: name,
        perPage: stateShared.perPage,
        page: 1,
      });
      observer.subscribe({
        async next(value: { iterator: any; paginationInfoData: any }) {
          dispatch({
            type: 'LAST_PAGE',
            payload: {
              lastPage: state.lastPage + value.paginationInfoData.last,
            },
          });
          if (value.iterator) {
            const callback = () =>
              getOrg({
                signal: abortController.signal,
                org: name,
                perPage: stateShared.perPage,
                page: 1,
                axiosCancel: axiosCancel.current,
              })
                .then((data: IDataOne) => {
                  dispatch({
                    type: 'LAST_PAGE',
                    payload: {
                      lastPage: state.lastPage + value.paginationInfoData.last,
                    },
                  });
                  actionController(data);
                })
                .catch((error) => {
                  actionResolvePromise({
                    action: ActionResolvedPromise.error,
                    setLoading,
                    setNotification,
                    isFetchFinish: isFetchFinish.current,
                    displayName: component,
                    error,
                  });
                });

            try {
              mainIter({ value: value.iterator, cb: callback, actionController });
            } catch (e) {
              throw new Error(e.message);
            }
          }
        },
        error(err: any) {
          actionResolvePromise({
            action: ActionResolvedPromise.error,
            setLoading,
            setNotification,
            isFetchFinish: isFetchFinish.current,
            displayName: component,
            err,
          });
        },
        complete() {
          console.log('Finished');
        },
      });
    });
  };
  const fetchUserMore = () => {
    // we want to preserve state.page so that when the user navigate away from Home, then go back again, we still want to retain state.page
    // so when they scroll again, it will fetch the correct next page. However, as the user already scroll, it causes state.page > 1
    // thus when they navigate away and go back again to Home, this will hit again, thus causing re-fetching the same data.
    // to prevent that, we need to reset the Home.js is unmounted.
    if (!isFetchFinish.current && state.page > 1) {
      // it's possible the user click Details.js and go back to Home.js again and find out that
      // that the previous page.current is already 2, but when he/she navigates aways from Home.js, it go back to page.current=1 again
      // so the scroll won't get fetch immediately. Thus, we need to persist state.page using reducer
      setLoading(true); // spawn loading spinner at bottom page
      setNotification('');
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
              action: ActionResolvedPromise.error,
              setLoading,
              setNotification,
              isFetchFinish: isFetchFinish.current,
              error: error,
              displayName: component,
            });
          });
      }
    }
  };
  return {
    fetchUserMore,
    fetchUser,
    isLoading,
    notification,
    setNotification,
    onClickTopic,
    clickedGQLTopic,
    isFetchFinish: isFetchFinish.current,
  };
};
export default useFetchUser;
