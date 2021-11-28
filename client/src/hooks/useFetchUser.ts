import { getUser } from '../services';
import { IDataOne } from '../typing/interface';
import { ActionResolvedPromise, MergedDataProps } from '../typing/type';
import { noop } from '../util/util';
import { useState } from 'react';
import { useTrackedState, useTrackedStateShared, useTrackedStateStargazers } from '../selectors/stateContextSelector';
import { useStableCallback } from '../util';
import useActionResolvePromise from './useActionResolvePromise';
import { useIsFetchFinish, useIsLoading, useNotification } from '../components/Home';
import { SEARCH_FOR_MORE_TOPICS, SEARCH_FOR_TOPICS } from '../graphql/queries';
import { ShouldRender } from '../typing/enum';

interface useFetchUser {
  component: string;
  abortController: AbortController;
}

//TO extract all JSON field
// const regex = new RegExp(
//   /(?:\"|\')(?<key>[^"]*)(?:\"|\')(?=:)(?:\:\s*)(?:\"|\')?(?<value>true|false|https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)|[0-9a-zA-Z\+\-\,\.\\/$]*)/gim
// );+
const transform = (obj: any) => {
  const owner = Object.assign({}, { login: obj.owner.login, avatar_url: obj.owner.avatarUrl, html_url: obj.owner.url });
  return Object.assign(
    {},
    {
      id: obj.databaseId,
      default_branch: obj.defaultBranchRef.name,
      stargazers_count: obj.stargazerCount,
      full_name: obj.nameWithOwner,
      owner: owner,
      description: obj.description,
      language:
        obj.languages.edges.length > 0 && obj.languages.edges.sort((a: any, b: any) => b.size - a.size)[0].node.name,
      topics: obj.repositoryTopics.nodes.length > 0 && obj.repositoryTopics.nodes.map((obj: any) => obj.topic.name),
      html_url: obj.url,
      name: obj.name,
      is_queried: false,
    }
  );
};
let context = new Map();
const useFetchUser = ({ component, abortController }: useFetchUser) => {
  const [, setNotification] = useNotification();
  const [isFetchFinish, setIsFetchFinish] = useIsFetchFinish();
  const [, setLoading] = useIsLoading();
  const { actionResolvePromise } = useActionResolvePromise();
  const [state, dispatch] = useTrackedState();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [, dispatchStargazers] = useTrackedStateStargazers();
  // useState is used when the HTML depends on it directly to render something
  const [clickedGQLTopic, setGQLTopic] = useState({
    variables: '',
    nextPageUrl: '',
  } as any);
  // useRef will assign a reference for each component, while a variable defined outside a function component will only be called once.
  // so don't use let page=1 outside of Home component. useRef makes sure same reference is returned during each render while it won't cause re-render
  // https://stackoverflow.com/questions/57444154/why-need-useref-to-contain-mutable-variable-but-not-define-variable-outside-the
  const onClickTopic = useStableCallback(async ({ variables }: any) => {
    if (abortController.signal.aborted) return;
    if (stateShared.tokenGQL !== '') {
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
      return fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${stateShared.tokenGQL}`,
        },
        body: JSON.stringify({
          query: SEARCH_FOR_TOPICS,
          variables: { queryTopic: variables.queryTopic + ' sort:updated-desc', perPage: 70 },
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (abortController.signal.aborted) return;
          if (result) {
            setGQLTopic({
              variables,
              nextPageUrl: result.data.search.pageInfo.hasNextPage ? result.data.search.pageInfo.endCursor : '',
            });
            const data = result.data.search.nodes.map((obj: any) => {
              return transform(obj);
            });
            let dataOne: {
              dataOne: MergedDataProps[];
              error_404: boolean;
              error_403: boolean;
              end: boolean;
              error_message: string | undefined;
            } = {
              dataOne: data,
              error_404: false,
              error_403: false,
              end: false,
              error_message: undefined,
            };
            actionController(dataOne);
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
    } else {
      dispatchShared({
        type: 'SET_SHOULD_RENDER',
        payload: {
          shouldRender: ShouldRender.LoginGQL,
        },
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
  const fetcher = async (name: string, context: Map<string, { org: boolean }>) => {
    if (context.has(name) && !context.get(name)!.org) {
      return await getUser({
        signal: abortController.signal,
        url: `https://api.github.com/users/${name}/starred?page=${state.page}&per_page=${stateShared.perPage}`,
      });
    } else {
      return await getUser({
        signal: abortController.signal,
        url: `https://api.github.com/orgs/${name}/repos?page=${state.page}&per_page=${stateShared.perPage}`,
      });
    }
  };
  const fetchUser = () => {
    return new Promise((resolve) => {
      if (!isFetchFinish.isFetchFinish) {
        setLoading({ isLoading: true });
        setNotification({ notification: '' });
        let userNameTransformed: string[];
        if (!Array.isArray(stateShared.queryUsername)) {
          userNameTransformed = [stateShared.queryUsername];
        } else {
          userNameTransformed = stateShared.queryUsername;
        }
        userNameTransformed.forEach((name) => {
          context.set(name, {
            count: context.has(name) ? context.get(name).count : 1,
            isExist: context.has(name) ? context.get(name).isExist : false,
            org: context.has(name) ? context.get(name).org : false,
          });
          const execute = async () => {
            const res = await fetcher(name, context);
            if (res.length === 0) {
              const ja = {
                dataOne: [],
                end: false,
                error_404: true,
                error_403: false,
                error_message: undefined,
              };
              actionController(ja);
            } else {
              const intersectionArr = res.filter((n: any) => !state.undisplayMergedData.some((n2) => n.id == n2.id));
              if (intersectionArr.length === 0) {
                // data already seen
                dispatch({
                  type: 'ADVANCE_PAGE',
                });
                resolve();
              } else if (res.length > 0 && intersectionArr.length > 0) {
                // data not seen yet
                const ja = {
                  dataOne: [...res],
                  end: false,
                  error_404: false,
                  error_403: false,
                  error_message: undefined,
                };
                actionController(ja);
                resolve(res);
              }
            }
          };
          execute().then(noop);
        });
      } else {
        resolve();
      }
    });
  };
  const fetchMoreTopics = () => {
    // TODO streaming render just like fetchUser above
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
      if (clickedGQLTopic.variables.queryTopic !== undefined) {
        fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${stateShared.tokenGQL}`,
          },
          body: JSON.stringify({
            query: SEARCH_FOR_MORE_TOPICS,
            variables: {
              after: clickedGQLTopic.nextPageUrl,
              queryTopic: clickedGQLTopic.variables.queryTopic + ' sort:updated-desc',
              perPage: 70,
            },
          }),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result && !abortController.signal.aborted) {
              setGQLTopic((prev: any) => {
                return {
                  ...prev,
                  nextPageUrl: result.data.search.pageInfo.hasNextPage ? result.data.search.pageInfo.endCursor : '',
                };
              });
              const data = result.data.search.nodes.map((obj: any) => {
                return transform(obj);
              });
              let dataOne: {
                dataOne: MergedDataProps[];
                error_404: boolean;
                error_403: boolean;
                end: boolean;
                error_message: string | undefined;
              } = {
                dataOne: data,
                error_404: false,
                error_403: false,
                end: false,
                error_message: undefined,
              };
              actionController(dataOne);
            }
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
    fetchMoreTopics,
    fetchUser,
    onClickTopic,
    clickedGQLTopic,
  };
};
export default useFetchUser;
