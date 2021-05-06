import React, { useCallback, useEffect, useRef, useState } from 'react';
import Results from './PureSearchBarBody/Results';
import SearchBarLayout from '../Layout/SearchBarLayout';
import { useClickOutside, useEventHandlerComposer } from '../hooks/hooks';
import { PureInput } from './PureInput';
import _ from 'lodash';
import { MergedDataProps, SearchesData, StargazerProps } from '../typing/type';
import { Then } from '../util/react-if/Then';
import { If } from '../util/react-if/If';
import Result from './PureSearchBarBody/ResultsBody/Result';
import { Typography } from '@material-ui/core';
import { useUserCardStyles } from '../DiscoverBody/CardDiscoverBody/UserCardStyle';
import HistoryIcon from '@material-ui/icons/History';
import { fastFilter, Loading } from '../util';
import { useApolloFactory } from '../hooks/useApolloFactory';
import { useLocation } from 'react-router-dom';
import { useTrackedState, useTrackedStateShared, useTrackedStateStargazers } from '../selectors/stateContextSelector';
import { createRenderElement } from '../Layout/MasonryLayout';
import ButtonQuestion from './PureSearchBarBody/ButtonQuestion';
import ButtonPageSetting from './PureSearchBarBody/ButtonPageSetting';
import ButtonTags from './PureSearchBarBody/ButtonTags';
import { noop } from '../util/util';

interface SearchBarProps {
  portalExpandable: any;
}

const SearchBar: React.FC<SearchBarProps> = ({ portalExpandable }) => {
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [stateStargazers, dispatchStargazers] = useTrackedStateStargazers();
  const [state, dispatch] = useTrackedState();
  const displayName: string | undefined = (SearchBar as React.ComponentType<any>).displayName;
  const { searchesData } = useApolloFactory(displayName!).query.getSearchesData();
  const searchesAdded = useApolloFactory(displayName!).mutation.searchesAdded;
  const username = useRef<any>();
  const classes = useUserCardStyles({ avatarSize: 20 });
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
    const usernameList = stateStargazers.stargazersQueueData.reduce((acc: string[], stargazer: StargazerProps) => {
      acc.push(stargazer.login);
      return acc;
    }, []);
    dispatchShared({
      type: 'USERNAME_ADDED',
      payload: {
        username: [...usernameList, username.current.getState()].filter((e) => !!e),
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
            getSearches: [
              Object.assign(
                {},
                {
                  search: char,
                  updatedAt: new Date(),
                  count: 1,
                }
              ),
            ],
          }).then(noop);
        });
    }
    username.current.clearState();
  };

  const onClickCb = useCallback((e: React.MouseEvent) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the purpose of getRootProps is to execute all eventhandlers from both parent and their children who're using it together
  // with the state at their respective component without the need to pass the state to the children.
  const { getRootProps } = useEventHandlerComposer({ onClickCb });

  const location = useLocation();

  useEffect(() => {
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
              return _.intersection(topics, state.filteredTopics).length > 0;
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
      return () => {
        isCancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filteredTopics, state.mergedData]); // we want this to be re-executed when the user scroll and fetchUserMore
  // being executed at Home.js, thus causing mergedData to change. Now if filteredTopics.length > 0, that means we only display new
  // cards that have been fetched that only match with filteredTopics.

  const whichToUse = useCallback(() => {
    if (state.filteredMergedData.length > 0) {
      return state.filteredMergedData;
    }
    return state.mergedData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mergedData, state.filteredMergedData]);

  const handleChange = useCallback((value: string) => {
    setValue(value);
  }, []);

  useEffect(() => {
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
        const languageAndTopics = _.uniq(topics);
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
      return () => {
        isCancelled = true;
        dispatch({
          type: 'VISIBLE',
          payload: { visible: false },
        });
        dispatch({
          type: 'LOADING',
          payload: {
            isLoading: false,
          },
        });
      };
    }
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

  const filter = (searchesHistory: SearchesData[] | undefined, valueRef: string) => {
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
  return (
    <SearchBarLayout style={{ width: `${stateShared.width}px` }} onSubmit={handleSubmit}>
      {(portal) => (
        <React.Fragment>
          {/* we separate this as new component since UI need to be updated as soon as possible
            thus causing heavy rendering. To prevent setState takes effect of rendering the children component
            to Home.tsx, we put it in new component */}
          {createRenderElement(PureInput, {
            setVisible,
            visibleSearchesHistory,
            setVisibleSearchesHistory,
            style,
            handleChange,
            ref: username,
          })}

          <If
            condition={
              searchesData &&
              searchesData.getSearches !== null &&
              searchesData.getSearches.length > 0 &&
              valueRef.length > 0 &&
              visibleSearchesHistory &&
              filter(searchesData?.getSearches, valueRef).length > 0
            }
          >
            <Then>
              <div className="resultsContainer" style={style} ref={resultsRef}>
                <ul className={'results'}>
                  {filter(searchesData?.getSearches, valueRef)
                    .sort((a, b) => b.count - a.count) //the most frequent searches at the top
                    .map((search: SearchesData, idx) => {
                      const newBody = search.search.replace(
                        new RegExp(valueRef.toLowerCase(), 'gi'),
                        (match: string) => `<mark style="background: #2769AA; color: white;">${match}</mark>`
                      );
                      return (
                        <Result getRootProps={getRootProps} userName={search.search} key={idx}>
                          <div className={classes.wrapper} style={{ borderBottom: 0 }}>
                            <HistoryIcon style={{ transform: 'scale(1.5)' }} />
                            <div className={classes.nameWrapper}>
                              <Typography variant="subtitle2" className={classes.typography}>
                                <div dangerouslySetInnerHTML={{ __html: newBody }} />
                              </Typography>
                            </div>
                          </div>
                        </Result>
                      );
                    })}
                  <If condition={state.isLoading}>
                    <Then>
                      <li className={'clearfix'}>
                        <Loading />
                      </li>
                    </Then>
                  </If>
                  <If condition={!state.isLoading}>
                    <Then>
                      {fastFilter((search: SearchesData) => {
                        const temp =
                          searchesData?.getSearches?.reduce((acc: any, obj: SearchesData) => {
                            acc.push(obj.search);
                            return acc;
                          }, []) ?? [];
                        return !temp.includes(Object.keys(search)[0]);
                      }, state.searchUsers).map((result, idx) => (
                        <Result getRootProps={getRootProps} userName={Object.keys(result).toString()} key={idx}>
                          <div className={classes.wrapper} style={{ borderBottom: 0 }}>
                            <img alt="avatar" className="avatar-img" src={Object.values(result).toString()} />
                            <div className={classes.nameWrapper}>
                              <Typography variant="subtitle2" className={classes.typography}>
                                {Object.keys(result)}
                              </Typography>
                            </div>
                          </div>
                        </Result>
                      ))}
                    </Then>
                  </If>
                </ul>
              </div>
            </Then>
          </If>

          <If condition={visible && filter(searchesData?.getSearches, valueRef).length === 0}>
            <Then>
              {createRenderElement(Results, {
                getRootProps,
                data: state.searchUsers,
                isLoading: state.isLoading,
                style,
                ref: resultsRef,
              })}
            </Then>
          </If>

          <div className="input-group-btn">
            {/* we need to use div instead of button because if we use button again
                        we cannot use ENTER keyboard for form submitting */}
            {createRenderElement(ButtonQuestion, { showTipsText })}
            {/* no need to separate since click event is only 1x rendering unlike onChange input at PureInput.tsx */}
            {createRenderElement(ButtonPageSetting, { showTipsText, portal })}
            {createRenderElement(ButtonTags, { showTipsText, portalExpandable })}
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
