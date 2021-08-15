import React, { useState } from 'react';
import SearchBarLayout from '../Layout/SearchBarLayout';
import { useEventHandlerComposer } from '../hooks/hooks';
import { MergedDataProps, StargazerProps } from '../typing/type';
import { useStableCallback } from '../util';
import { useLocation } from 'react-router-dom';
import { useTrackedState, useTrackedStateShared, useTrackedStateStargazers } from '../selectors/stateContextSelector';
import Loadable from 'react-loadable';
import { Then } from '../util/react-if/Then';
import { If } from '../util/react-if/If';
import { ShouldRender } from '../typing/enum';
import ButtonQuestion from './PureSearchBarBody/ButtonQuestion';
import ButtonPageSetting from './PureSearchBarBody/ButtonPageSetting';
import ButtonTags from './PureSearchBarBody/ButtonTags';
import Empty from '../Layout/EmptyLayout';
import PureInput from './PureInput';
import useDeepCompareEffect from '../hooks/useDeepCompareEffect';
import { useQueryUsername, useVisible, useVisibleSearchesHistory } from '../SearchBar';
import { each, filter, map, parallel } from 'async';
import { useIsFetchFinish } from '../Home';
import { useGetSearchesMutation } from '../apolloFactory/useGetSearchesMutation';

const SearchHistories = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "SearchHistories" */ './PureSearchBarBody/ResultsBody/SearchHistories'),
});
const Searches = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "SearchHistories" */ './PureSearchBarBody/Searches'),
});

interface SearchBarProps {
  portalExpandable: any;
}

const SearchBar: React.FC<SearchBarProps> = ({ portalExpandable }) => {
  const searchesAdded = useGetSearchesMutation();
  const [visible, setVisible] = useVisible();
  const [visibleSearchesHistory, setVisibleSearchesHistory] = useVisibleSearchesHistory();
  const [username, setUsername] = useQueryUsername();
  const [, setIsFetchFinish] = useIsFetchFinish();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [stateStargazers, dispatchStargazers] = useTrackedStateStargazers();
  const [state, dispatch] = useTrackedState();

  const size = {
    width: '500px',
    minWidth: '100px',
    maxWidth: '100%',
  };
  let style: React.CSSProperties;
  if (stateShared.width < 711) {
    style = { width: `${stateShared.width - 200}px` };
  } else {
    style = {
      maxWidth: size.maxWidth,
      width: size.width,
      minWidth: size.minWidth,
    };
  }
  const [valueRef, setValue] = useState<string>('');

  const showTipsText = (type: string) => {
    switch (type) {
      case 'search':
        return `Searching GITHUB username will return both the users' starred and watched repos.
        We will fetch ${stateShared.perPage} pages per scroll based on your setting.`;
      case 'filterTags':
        return 'Filter data based on topics tags.';
      case 'filterSearchBar':
        return 'Filter data based on any text.';
      case 'perPageSetting':
        return 'How many page should we fetch.';
      case 'noData':
        return 'No data yet. Please search first!';
      case 'filterSeen':
        return 'Hide previously seen cards';
      case 'noFilterSeen':
        return 'Show previously seen cards';
      case 'login':
        return 'Please login first to access this feature';
      default:
        return '';
    }
  };

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    const usernameList = stateStargazers.stargazersQueueData.reduce((acc: string[], stargazer: StargazerProps) => {
      acc.push(stargazer.login);
      return acc;
    }, []);
    setUsername('');
    parallel([
      () => setIsFetchFinish({ isFetchFinish: false }),
      () =>
        dispatchShared({
          type: 'QUERY_USERNAME',
          payload: {
            queryUsername: [...usernameList, username].filter((e) => !!e),
          },
        }),
      () =>
        dispatchShared({
          type: 'SET_SHOULD_RENDER',
          payload: {
            shouldRender: ShouldRender.Home,
          },
        }),
      () =>
        dispatchStargazers({
          type: 'REMOVE_QUEUE',
        }),
      () =>
        dispatchStargazers({
          type: 'REMOVE_ALL',
        }),
      () =>
        dispatch({
          type: 'REMOVE_ALL',
        }),
      function () {
        if (!stateShared.queryUsername.includes(username)) {
          setVisible(false);
          setVisibleSearchesHistory(false);
          if (stateShared.isLoggedIn) {
            filter(
              [...usernameList, username],
              (e: any, cb) => {
                if (!!e) {
                  cb(null, e);
                  return e;
                } else {
                  cb(null, undefined);
                  return undefined;
                }
              },
              (err, results: any) => {
                if (err) {
                  throw new Error('err');
                }
                if (!results) {
                  return;
                }
                each(results, (char: string) => {
                  searchesAdded({
                    getSearches: {
                      searches: [
                        Object.assign(
                          {},
                          {
                            search: char,
                            updatedAt: new Date(),
                            count: 1,
                          }
                        ),
                      ],
                    },
                  });
                });
              }
            );
          }
        }
      },
    ]);
  };

  const location = useLocation();

  useDeepCompareEffect(() => {
    let isCancelled = false;
    if (location.pathname === '/' && !isCancelled) {
      if (state.filteredTopics.length > 0) {
        filter(
          state.mergedData,
          (x: any, cb) => {
            const topics = [...x.topics];
            if (x.language) {
              topics.push(x.language.toLowerCase());
              if (
                state.filteredTopics.join().includes(topics.join(' ')) ||
                topics.join(' ').includes(state.filteredTopics.join())
              ) {
                cb(null, x);
                return x;
              } else {
                cb(null, undefined);
                return undefined;
              }
            } else {
              cb(null, undefined);
              return undefined;
            }
          },
          (err, result: any) => {
            if (err) {
              throw new Error('err');
            }
            if (!result) {
              return;
            }
            return dispatch({
              type: 'MERGED_DATA_FILTER_BY_TAGS',
              payload: {
                filteredMergedData: result,
              },
            });
          }
        );
      } else if (state.filteredTopics.length === 0 && state.filteredMergedData.length > 0) {
        dispatch({
          type: 'MERGED_DATA_FILTER_BY_TAGS',
          payload: {
            filteredMergedData: [],
          },
        });
        dispatch({
          type: 'SET_TOPICS_FILTERED',
          payload: {
            topicsFiltered: [],
          },
        });
      }
    }
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filteredTopics, state.mergedData, state.filterBySeen]); // we want this to be re-executed when the user scroll and fetchUserMore
  // being executed at Home.js, thus causing mergedData to change. Now if filteredTopics.length > 0, that means we only display new
  // cards that have been fetched that only match with filteredTopics.

  const handleChange = useStableCallback((value: string) => setValue(value));

  useDeepCompareEffect(() => {
    let isCancelled = false;
    if (location.pathname === '/' && !isCancelled) {
      // this is to render the new topic tags based on filteredMergedData when it throws new data
      const result: any[] = [];
      (state.filterBySeen ? state.mergedData : state.filteredMergedData).forEach((obj: MergedDataProps) => {
        const isTopicsNull = obj.topics ?? [];
        const topics = [...isTopicsNull];
        if (obj.language) {
          topics.push(obj.language.toLowerCase());
        }
        const languageAndTopics = [...new Set(topics)];
        each(
          languageAndTopics,
          (topic, cb) => {
            const index = (state.filterBySeen ? state.topicsOriginal : state.topicsFiltered).findIndex(
              (x) => x.topic === topic
            );
            if (!result.find((obj) => obj.topic === topic)) {
              result.push(
                Object.assign(
                  {},
                  {
                    topic: topic,
                    count: 1,
                    clicked:
                      index > -1
                        ? (state.filterBySeen ? state.topicsOriginal : state.topicsFiltered)[index].clicked
                        : false,
                  }
                )
              );
            } else {
              map(result, (obj: any) => {
                if (obj.topic === topic) {
                  obj.count += 1;
                }
                return obj;
              });
            }
            // @ts-ignore
            cb(null, result);
            return result;
          },
          function (err) {
            if (err) {
              throw new Error('err');
            }
            if (result.length > 0) {
              if (state.filterBySeen) {
                dispatch({
                  type: 'SET_TOPICS_ORIGINAL',
                  payload: {
                    topicsOriginal: result,
                  },
                });
              } else {
                dispatch({
                  type: 'SET_TOPICS_FILTERED',
                  payload: {
                    topicsFiltered: result,
                  },
                });
              }
            }
          }
        );
      });
    }
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mergedData, state.filterBySeen]);

  const filterJ = (
    searchesHistory: Array<{ search: string; count: number; updatedAt: Date }> | undefined,
    valueRef: string
  ) => {
    const result: any[] = [];
    if (searchesHistory && searchesHistory.length > 0) {
      for (const searchHistory of searchesHistory) {
        if (searchHistory.search.toLowerCase().indexOf(valueRef.toLowerCase()) >= 0) {
          result.push(searchHistory);
        }
      }
    }
    return result;
  };
  const onClickCb = useStableCallback((e: React.MouseEvent) => {
    e.preventDefault();
    parallel([
      () => setValue(''),
      () =>
        dispatch({
          type: 'REMOVE_ALL',
        }),
      () =>
        dispatchStargazers({
          type: 'REMOVE_ALL',
        }),
      () =>
        dispatchStargazers({
          type: 'REMOVE_QUEUE',
        }),
    ]);
  });

  // the purpose of getRootProps is to execute all eventhandlers from both parent and their children who're using it together
  // with the state at their respective component without the need to pass the state to the children.
  const { getRootProps } = useEventHandlerComposer({ onClickCb });
  return (
    <SearchBarLayout style={{ width: `${stateShared.width}px` }} onSubmit={handleSubmit}>
      {(portal) => (
        <React.Fragment>
          {/* we separate this as new component since UI need to be updated as soon as possible
            thus causing heavy rendering. To prevent setState takes effect of rendering the children component
            to Home.tsx, we put it in new component */}
          <PureInput style={style} handleChange={handleChange} />
          <If
            condition={
              stateShared?.searches?.length > 0 &&
              valueRef.length > 0 &&
              visibleSearchesHistory &&
              filterJ(stateShared?.searches, valueRef).length > 0
            }
          >
            <Then>
              <SearchHistories
                searches={stateShared?.searches}
                filter={filterJ}
                valueRef={valueRef}
                isLoading={state.isLoading}
                getRootProps={getRootProps}
                width={stateShared.width}
                stateSearchUsers={state.searchUsers}
              />
            </Then>
          </If>
          <If condition={visible && filterJ(stateShared?.searches, valueRef).length === 0}>
            <Then>
              <Searches
                data={state.searchUsers}
                style={style}
                isLoading={state.isLoading}
                getRootProps={getRootProps}
              />
            </Then>
          </If>

          <div className="input-group-btn">
            {/* we need to use div instead of button because if we use button again
                        we cannot use ENTER keyboard for form submitting */}
            <ButtonQuestion showTipsText={showTipsText} />
            {/* no need to separate since click event is only 1x rendering unlike onChange input at PureInput.tsx */}
            <ButtonPageSetting showTipsText={showTipsText} portal={portal} />
            <ButtonTags showTipsText={showTipsText} portalExpandable={portalExpandable} />
            <button className="btn btn-primary" type="submit">
              <span className="glyphicon glyphicon-search" />
            </button>
          </div>
        </React.Fragment>
      )}
    </SearchBarLayout>
  );
};
SearchBar.displayName = 'SearchBar';
export default SearchBar;
