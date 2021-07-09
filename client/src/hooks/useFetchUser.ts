import { getOrg, getSearchTopics, getUser } from '../services';
import { IDataOne } from '../typing/interface';
import { ActionResolvedPromise, MergedDataProps, Nullable } from '../typing/type';
import { noop } from '../util/util';
import { useRef, useState } from 'react';
import { useTrackedState, useTrackedStateShared, useTrackedStateStargazers } from '../selectors/stateContextSelector';
import { Counter, useStableCallback } from '../util';
import useActionResolvePromise from './useActionResolvePromise';

interface useFetchUser {
  component: string;
}

const useFetchUser = ({ component }: useFetchUser) => {
  const { actionResolvePromise } = useActionResolvePromise();
  const axiosCancel = useRef<boolean>(false);
  const [state, dispatch] = useTrackedState();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [, dispatchStargazers] = useTrackedStateStargazers();
  const abortController = new AbortController();
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
        .then((result: IDataOne) => {
          paginationInfo += result.paginationInfoData;
          dispatch({
            type: 'LAST_PAGE',
            payload: {
              lastPage: paginationInfo,
            },
          });
          actionController(result);
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
  const dataPrefetch = useRef<IDataOne | undefined>();
  const prefetch = (name: string, axiosCancel: boolean) => () => {
    getUser({
      signal: undefined,
      username: name,
      perPage: stateShared.perPage,
      page: state.page + 1,
      axiosCancel,
    })
      .then((data: IDataOne) => {
        if (!!data && (data.error_404 || data.error_403)) {
          getOrg({
            signal: undefined,
            org: name,
            perPage: stateShared.perPage,
            page: state.page + 1,
            axiosCancel,
          })
            .then((data: IDataOne) => {
              dataPrefetch.current = data;
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
        } else {
          dataPrefetch.current = data;
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
  };
  const isFunction = (value: () => void) =>
    value && (Object.prototype.toString.call(value) === '[object Function]' || 'function' === typeof value || true)
      ? value()
      : new Error('Not valid function!');
  const actionController = (res: IDataOne, prefetch = noop, callback?: Promise<any> | any) => {
    // compare new with old data, if they differ, that means it still has data to fetch
    const promiseOrNot = () => {
      callback() instanceof Promise && res !== undefined && (res.error_404 || res.error_403)
        ? callback()
        : isFunction(callback);
    };
    if (isDataExists(res)) {
      const ja = Counter(res.dataOne, 'language');
      const repoStat = Object.entries(ja)
        .slice(0, 5)
        .map((arr: any) => {
          const ja = state.repoStat.find((xx) => xx[0] === arr[0]) || [0, 0];
          return [arr[0], ja[1] + arr[1]];
        });
      dispatch({
        type: 'SHOULD_IMAGES_DATA_ADDED',
        payload: {
          shouldFetchImages: true,
        },
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
        prefetch,
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
  };

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
    const promises: Promise<void>[] = [];
    let paginationInfo = 0;
    userNameTransformed.forEach((name) => {
      promises.push(
        getUser({
          signal: abortController.signal,
          username: name,
          perPage: stateShared.perPage,
          page: 1,
          axiosCancel: axiosCancel.current,
        })
          .then((data: IDataOne) => {
            const callback = () =>
              getOrg({
                signal: abortController.signal,
                org: name,
                perPage: stateShared.perPage,
                page: 1,
                axiosCancel: axiosCancel.current,
              })
                .then((data: IDataOne) => {
                  paginationInfo += data.paginationInfoData;
                  dispatch({
                    type: 'LAST_PAGE',
                    payload: {
                      lastPage: paginationInfo,
                    },
                  });
                  const temp = prefetch(name, axiosCancel.current);
                  actionController(data, temp);
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
            paginationInfo += data.paginationInfoData;
            dispatch({
              type: 'LAST_PAGE',
              payload: {
                lastPage: paginationInfo,
              },
            });
            const temp = prefetch(name, axiosCancel.current);
            actionController(data, temp, callback);
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
          })
      );
    });
    promises.forEach((promise) => promise.then(noop));
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
          .then((res: IDataOne) => {
            actionController(res);
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
      } else if (dataPrefetch.current && dataPrefetch.current.dataOne.length > 0) {
        let userNameTransformed: string[];
        if (!Array.isArray(stateShared.queryUsername)) {
          userNameTransformed = [stateShared.queryUsername];
        } else {
          userNameTransformed = stateShared.queryUsername;
        }
        userNameTransformed.forEach((user) => {
          const temp = prefetch(user, axiosCancel.current);
          const clone = JSON.parse(JSON.stringify(dataPrefetch.current));
          actionController(clone, temp);
        });
        dataPrefetch.current = undefined;
      }
    }
  };
  return { fetchUserMore, fetchUser, isLoading, notification, setNotification, onClickTopic, clickedGQLTopic };
};
export default useFetchUser;
