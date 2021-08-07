import React, { createRef, useEffect, useRef, useState } from 'react';
import SearchBarLayout from '../Layout/SearchBarLayout';
import { useClickOutside, useEventHandlerComposer } from '../hooks/hooks';
import { MergedDataProps, StargazerProps } from '../typing/type';
import { fastFilter, useStableCallback } from '../util';
import { useApolloFactory } from '../hooks/useApolloFactory';
import { useLocation } from 'react-router-dom';
import { useTrackedState, useTrackedStateShared, useTrackedStateStargazers } from '../selectors/stateContextSelector';
import { noop } from '../util/util';
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

const ResultRenderer = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "ResultRenderer" */ './PureSearchBarBody/ResultsBody/ResultRenderer'),
});
const Results = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "ResultRenderer" */ './PureSearchBarBody/Results'),
});

interface SearchBarProps {
  portalExpandable: any;
}

const SearchBar: React.FC<SearchBarProps> = ({ portalExpandable }) => {
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [stateStargazers, dispatchStargazers] = useTrackedStateStargazers();
  const [state, dispatch] = useTrackedState();
  const displayName: string = (SearchBar as React.ComponentType<any>).displayName || '';
  const { searchesData } = useApolloFactory(displayName!).query.getSearchesData();
  const searchesAdded = useApolloFactory(displayName!).mutation.searchesAdded;
  const username = useRef<any>();
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
  const [visible, setVisible] = useState(false);
  const [visibleSearchesHistory, setVisibleSearchesHistory] = useState(true);

  const resultsRef = useRef(null);

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
    if (!stateShared.queryUsername.includes(username.current.getState())) {
      const usernameList = stateStargazers.stargazersQueueData.reduce((acc: string[], stargazer: StargazerProps) => {
        acc.push(stargazer.login);
        return acc;
      }, []);
      dispatchShared({
        type: 'SET_SHOULD_RENDER',
        payload: {
          shouldRender: ShouldRender.Home,
        },
      });
      dispatchShared({
        type: 'QUERY_USERNAME',
        payload: {
          queryUsername: [...usernameList, username.current.getState()].filter((e) => !!e),
        },
      });
      dispatchShared({
        type: 'SET_SHOULD_RENDER',
        payload: {
          shouldRender: ShouldRender.Home,
        },
      });
      dispatch({
        type: 'REMOVE_ALL',
      });
      dispatchStargazers({
        type: 'REMOVE_ALL',
      });
      dispatchStargazers({
        type: 'REMOVE_QUEUE',
      });
      setVisible(false);
      setVisibleSearchesHistory(false);
      if (stateShared.isLoggedIn) {
        [...usernameList, username.current.getState()]
          .filter((e) => !!e)
          .forEach((char) => {
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
            }).then(noop);
          });
      }
    }
    username.current.clearState();
  };

  const location = useLocation();

  useDeepCompareEffect(() => {
    let isCancelled = false;
    if (location.pathname === '/' && !isCancelled) {
      if (state.filteredTopics.length > 0) {
        dispatch({
          type: 'MERGED_DATA_FILTER_BY_TAGS',
          payload: {
            filteredMergedData: fastFilter((x: MergedDataProps) => {
              const topics = [...x.topics];
              if (x.language) {
                topics.push(x.language.toLowerCase());
              }
              return (
                [...topics, ...state.filteredTopics].reduce((a: any, b: any) => a.filter((c: string) => b.includes(c)))
                  .length > 0
              );
              // return _.intersection(topics, state.filteredTopics).length === state.filteredTopics.length;
            }, state.mergedData),
          },
        });
      } else {
        dispatch({
          type: 'MERGED_DATA_FILTER_BY_TAGS',
          payload: {
            filteredMergedData: [],
          },
        });
      }
    }
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filteredTopics, state.mergedData]); // we want this to be re-executed when the user scroll and fetchUserMore
  // being executed at Home.js, thus causing mergedData to change. Now if filteredTopics.length > 0, that means we only display new
  // cards that have been fetched that only match with filteredTopics.

  const whichToUse = useStableCallback(() => {
    if (state.filteredMergedData.length > 0) {
      return state.filteredMergedData;
    }
    return state.mergedData;
  });

  const handleChange = useStableCallback((value: string) => setValue(value));

  useDeepCompareEffect(() => {
    let isCancelled = false;
    if (location.pathname === '/' && !isCancelled) {
      // this is to render the new topic tags based on filteredMergedData when it throws new data
      const result: any[] = [];
      whichToUse().forEach((obj: MergedDataProps) => {
        const isTopicsNull = obj.topics ?? [];
        const topics = [...isTopicsNull];
        if (obj.language) {
          topics.push(obj.language.toLowerCase());
        }
        const languageAndTopics = [...new Set(topics)];
        languageAndTopics.forEach((topic: string) => {
          const index = state.topics.findIndex((x) => x.topic === topic);
          if (!result.find((obj) => obj.topic === topic)) {
            result.push(
              Object.assign(
                {},
                {
                  topic: topic,
                  count: 1,
                  clicked: index > -1 ? state.topics[index].clicked : false,
                }
              )
            );
          } else {
            const index = result.findIndex((obj) => obj.topic === topic);
            result[index].count = result[index].count + 1;
          }
        });
      });
      dispatch({
        type: 'SET_TOPICS',
        payload: {
          topics: result,
        },
      });
    }
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filteredMergedData]);

  useClickOutside(resultsRef, () => {
    setVisible(false);
    setVisibleSearchesHistory(false);
    dispatch({
      type: 'VISIBLE',
      payload: { visible: false },
    });
  });

  const filter = (
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
    setVisible(false);
    setValue('');
    dispatch({
      type: 'REMOVE_ALL',
    });
    dispatchStargazers({
      type: 'REMOVE_ALL',
    });
    dispatchStargazers({
      type: 'REMOVE_QUEUE',
    });
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
          <PureInput
            setVisible={setVisible}
            visibleSearchesHistory={visibleSearchesHistory}
            setVisibleSearchesHistory={setVisibleSearchesHistory}
            style={style}
            handleChange={handleChange}
            ref={username}
          />
          <If
            condition={
              searchesData &&
              searchesData.getSearches !== null &&
              searchesData?.getSearches?.searches?.length > 0 &&
              valueRef.length > 0 &&
              visibleSearchesHistory &&
              filter(searchesData?.getSearches?.searches, valueRef).length > 0
            }
          >
            <Then>
              <ResultRenderer
                searches={searchesData?.getSearches?.searches}
                filter={filter}
                valueRef={valueRef}
                isLoading={state.isLoading}
                getRootProps={getRootProps}
                width={stateShared.width}
                stateSearchUsers={state.searchUsers}
              />
            </Then>
          </If>
          <If condition={visible && filter(searchesData?.getSearches?.searches, valueRef).length === 0}>
            <Then>
              <Results
                data={state.searchUsers}
                style={style}
                ref={resultsRef}
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
