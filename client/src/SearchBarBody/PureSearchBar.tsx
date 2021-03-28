import React, { useCallback, useEffect, useRef, useState } from 'react';
import Results from './PureSearchBarBody/Results';
import Tooltip from '@material-ui/core/Tooltip';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import SearchBarLayout from '../Layout/SearchBarLayout';
import { useClickOutside, useEventHandlerComposer } from '../hooks/hooks';
import { createPortal } from 'react-dom';
import InputSlider from '../Layout/SliderLayout';
import { PureInput } from './PureInput';
import { Tags } from './PureSearchBarBody/Tags';
import _ from 'lodash';
import { MergedDataProps, SearchesData, StargazerProps, TopicsProps } from '../typing/type';
import { Then } from '../util/react-if/Then';
import { If } from '../util/react-if/If';
import useCollapse from '../hooks/useCollapse';
import clsx from 'clsx';
import { IAction, IState, IStateShared, IStateStargazers } from '../typing/interface';
import Result from './PureSearchBarBody/ResultsBody/Result';
import { Typography } from '@material-ui/core';
import { useUserCardStyles } from '../HomeBody/CardBody/UserCardStyle';
import HistoryIcon from '@material-ui/icons/History';
import { fastFilter, Loading } from '../util';
import { useApolloFactory } from '../hooks/useApolloFactory';
import { Action } from '../store/Home/reducer';
import { ActionStargazers } from '../store/Staargazers/reducer';
import { ActionShared } from '../store/Shared/reducer';

const defaultTheme = createMuiTheme();
const theme = createMuiTheme({
  overrides: {
    MuiTooltip: {
      tooltip: {
        fontSize: '16px',
      },
    },
  },
});

interface SearchBarProps {
  portalExpandable: any;
  state: { state: IState; stateShared: IStateShared; stateStargazers: IStateStargazers };
  dispatchStargazers: React.Dispatch<IAction<ActionStargazers>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
  dispatch: React.Dispatch<IAction<Action>>;
}

const SearchBar: React.FC<SearchBarProps> = React.memo(
  ({ portalExpandable, dispatch, dispatchShared, dispatchStargazers, state }) => {
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
    if (state.stateShared.width < 711) {
      style = { width: `${state.stateShared.width - 200}px` };
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
    const [renderSlider, setExpandableSlider] = useState(false);
    const [renderTopicTags, setExpandableTopicTags] = useState(false);
    const { getToggleProps: toogleTopicTags, getCollapseProps: collapseTopicTags } = useCollapse({
      defaultExpanded: false, // is the images already expanded in the first place?
      onExpandStart() {
        setExpandableTopicTags(true);
      },
      onCollapseEnd() {
        setExpandableTopicTags(false);
      },
    });
    const resultsRef = useRef(null);

    const showTipsText = (type: string) => {
      switch (type) {
        case 'search':
          return `Searching GITHUB username will return both the users' starred and watched repos.
        We will fetch ${state.stateShared.perPage} pages per scroll based on your setting.`;
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
      const usernameList = state.stateStargazers.stargazersQueueData.reduce(
        (acc: string[], stargazer: StargazerProps) => {
          acc.push(stargazer.login);
          return acc;
        },
        []
      );
      if (username.current.getState() !== '') {
        dispatchShared({
          type: 'USERNAME_ADDED',
          payload: {
            username: [...usernameList, username.current.getState()],
          },
        });
      } else {
        dispatchShared({
          type: 'USERNAME_ADDED',
          payload: {
            username: usernameList,
          },
        });
      }
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
      if (state.stateShared.isLoggedIn) {
        searchesAdded({
          variables: {
            search: [
              Object.assign(
                {},
                {
                  search: username.current.getState(),
                  updatedAt: new Date(),
                  count: 1,
                }
              ),
            ],
          },
        }).then(() => {});
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

    const handleClickSlider = (event: React.MouseEvent): void => {
      event.preventDefault();
      setExpandableSlider(!renderSlider);
    };

    const handleClickSearchTopicTags = (event: React.MouseEvent): void => {
      event.preventDefault();
    };

    const handleClickFilterSeenCards = (event: React.MouseEvent): void => {
      event.preventDefault();
      dispatch({
        type: 'FILTER_CARDS_BY_SEEN',
        payload: {
          filterBySeen: !state.state.filterBySeen,
        },
      });
    };
    const dispatchPerPage = (perPage: string) => {
      dispatchShared({
        type: 'PER_PAGE',
        payload: {
          perPage: perPage,
        },
      });
    };
    const spawnSlider = (portal: React.RefObject<Element>) => {
      if (portal.current === null) {
        return null;
      } else {
        return createPortal(
          <div style={{ position: 'absolute' }}>
            <InputSlider
              type={'perPage'}
              inputWidth={40}
              sliderWidth={480}
              defaultValue={state.stateShared.perPage}
              dispatch={dispatchPerPage}
              maxSliderRange={1000}
            />
          </div>,
          portal.current
        );
      }
    };

    const spawnTopicTags = () => {
      if (portalExpandable.current === null) {
        return null;
      } else {
        return createPortal(
          <div className={'tags'} {...collapseTopicTags()}>
            {state.state.topics.map((obj: TopicsProps, idx: number) => {
              if (renderTopicTags) {
                return <Tags key={idx} obj={obj} clicked={obj.clicked} state={state.state} dispatch={dispatch} />;
              }
              return <></>;
            })}
          </div>,
          portalExpandable.current
        );
      }
    };

    // the purpose of getRootProps is to execute all eventhandlers from both parent and their children who're using it together
    // with the state at their respective component without the need to pass the state to the children.
    const { getRootProps } = useEventHandlerComposer({ onClickCb });

    useEffect(() => {
      if (document.location.pathname === '/') {
        if (state.state.filteredTopics.length > 0) {
          dispatch({
            type: 'MERGED_DATA_FILTER_BY_TAGS',
            payload: {
              filteredMergedData: fastFilter((x: MergedDataProps) => {
                const topics = [...x.topics];
                if (x.language) {
                  topics.push(x.language.toLowerCase());
                }
                return _.intersection(topics, state.state.filteredTopics).length > 0;
                // return _.intersection(topics, state.state.filteredTopics).length === state.state.filteredTopics.length;
              }, state.state.mergedData),
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.state.filteredTopics, state.state.mergedData]); // we want this to be re-executed when the user scroll and fetchUserMore
    // being executed at Home.js, thus causing mergedData to change. Now if filteredTopics.length > 0, that means we only display new
    // cards that have been fetched that only match with filteredTopics.

    const whichToUse = useCallback(() => {
      if (state.state.filteredMergedData.length > 0) {
        return state.state.filteredMergedData;
      }
      return state.state.mergedData;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.state.mergedData, state.state.filteredMergedData]);

    const handleChange = useCallback((value: string) => {
      setValue(value);
    }, []);

    useEffect(() => {
      if (document.location.pathname === '/') {
        // this is to render the new topic tags based on filteredMergedData when it throws new data
        const result: any[] = [];
        whichToUse().forEach((obj: MergedDataProps) => {
          const isTopicsNull = obj.topics || [];
          const topics = [...isTopicsNull];
          if (obj.language) {
            topics.push(obj.language.toLowerCase());
          }
          const languageAndTopics = _.uniq(topics);
          languageAndTopics.forEach((topic: string) => {
            const index = state.state.topics.findIndex((x) => x.topic === topic);
            if (!result.find((obj) => obj.topic === topic)) {
              result.push(
                Object.assign(
                  {},
                  {
                    topic: topic,
                    count: 1,
                    clicked: index > -1 ? state.state.topics[index].clicked : false,
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.state.filteredMergedData]);

    useEffect(() => {
      if (document.location.pathname === '/') {
        return () => {
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
    }, []);
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
      <SearchBarLayout style={{ width: `${state.stateShared.width}px` }} onSubmit={handleSubmit}>
        {(portal) => (
          <React.Fragment>
            {renderSlider && spawnSlider(portal)}
            {renderTopicTags && spawnTopicTags()}
            {/* we separate this as new component since UI need to be updated as soon as possible
            thus causing heavy rendering. To prevent setState takes effect of rendering the children component
            to Home.tsx, we put it in new component */}
            <PureInput
              setVisible={setVisible}
              stateStargazers={state.stateStargazers}
              visibleSearchesHistory={visibleSearchesHistory}
              setVisibleSearchesHistory={setVisibleSearchesHistory}
              style={style}
              state={state.state}
              dispatch={dispatch}
              handleChange={handleChange}
              ref={username}
              dispatchStargazersUser={dispatchStargazers}
            />

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
                          <Result
                            state={state.stateShared}
                            getRootProps={getRootProps}
                            userName={search.search}
                            key={idx}
                            dispatch={dispatch}
                            dispatchShared={dispatchShared}
                            dispatchStargazer={dispatchStargazers}
                          >
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
                    <If condition={state.state.isLoading}>
                      <Then>
                        <li className={'clearfix'}>
                          <Loading />
                        </li>
                      </Then>
                    </If>
                    <If condition={!state.state.isLoading}>
                      <Then>
                        {fastFilter((search: SearchesData) => {
                          const temp =
                            searchesData?.getSearches?.reduce((acc: any, obj: SearchesData) => {
                              acc.push(obj.search);
                              return acc;
                            }, []) || [];
                          return !temp.includes(Object.keys(search)[0]);
                        }, state.state.searchUsers).map((result, idx) => (
                          <Result
                            state={state.stateShared}
                            getRootProps={getRootProps}
                            userName={Object.keys(result).toString()}
                            key={idx}
                            dispatch={dispatch}
                            dispatchShared={dispatchShared}
                            dispatchStargazer={dispatchStargazers}
                          >
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
                <Results
                  ref={resultsRef}
                  state={state.stateShared}
                  getRootProps={getRootProps}
                  data={state.state.searchUsers}
                  isLoading={state.state.isLoading}
                  style={style}
                  dispatch={dispatch}
                  dispatchShared={dispatchShared}
                  dispatchStargazer={dispatchStargazers}
                />
              </Then>
            </If>

            <div className="input-group-btn">
              {/* we need to use div instead of button because if we use button again
                        we cannot use ENTER keyboard for form submitting */}
              <MuiThemeProvider theme={defaultTheme}>
                <MuiThemeProvider theme={theme}>
                  <Tooltip title={showTipsText('search')}>
                    <div className="btn btn-default" style={{ cursor: 'default' }}>
                      <span className="glyphicon glyphicon-question-sign" />
                    </div>
                  </Tooltip>
                </MuiThemeProvider>
              </MuiThemeProvider>

              {/* no need to separate since click event is only 1x rendering unlike onChange input at PureInput.tsx */}
              <MuiThemeProvider theme={defaultTheme}>
                <MuiThemeProvider theme={theme}>
                  <Tooltip title={showTipsText('perPageSetting')}>
                    <div
                      onClick={handleClickSlider}
                      className={clsx('btn', {
                        'btn-success': renderSlider,
                        'btn-default': !renderSlider,
                      })}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="glyphicon glyphicon-duplicate" />
                    </div>
                  </Tooltip>
                </MuiThemeProvider>
              </MuiThemeProvider>

              <MuiThemeProvider theme={defaultTheme}>
                <MuiThemeProvider theme={theme}>
                  <Tooltip title={showTipsText(state.state.mergedData.length > 0 ? 'filterTags' : 'noData')}>
                    <div
                      {...toogleTopicTags({
                        onClick: handleClickSearchTopicTags,
                        disabled: state.state.mergedData.length > 0 ? false : true,
                      })}
                      className={clsx('btn', {
                        'btn-success': renderTopicTags,
                        'btn-default': !renderTopicTags,
                      })}
                      style={state.state.mergedData.length > 0 ? { cursor: 'pointer' } : { cursor: 'not-allowed' }}
                    >
                      <span className="glyphicon glyphicon-tags" />
                    </div>
                  </Tooltip>
                </MuiThemeProvider>
              </MuiThemeProvider>

              <MuiThemeProvider theme={defaultTheme}>
                <MuiThemeProvider theme={theme}>
                  <If condition={state.stateShared.isLoggedIn}>
                    <Then>
                      <Tooltip title={showTipsText(`${state.state.filterBySeen ? 'noFilterSeen' : 'filterSeen'}`)}>
                        <div onClick={handleClickFilterSeenCards} className="btn" style={{ cursor: 'pointer' }}>
                          <span
                            className={`glyphicon ${
                              state.state.filterBySeen ? 'glyphicon-eye-close' : 'glyphicon-eye-open'
                            }`}
                          />
                        </div>
                      </Tooltip>
                    </Then>
                  </If>
                  <If condition={!state.stateShared.isLoggedIn}>
                    <Then>
                      <Tooltip title={showTipsText(`login`)}>
                        <div className="btn" style={{ cursor: 'not-allowed', opacity: 0.6 }}>
                          <span
                            className={`glyphicon ${
                              state.state.filterBySeen ? 'glyphicon-eye-close' : 'glyphicon-eye-open'
                            }`}
                          />
                        </div>
                      </Tooltip>
                    </Then>
                  </If>
                </MuiThemeProvider>
              </MuiThemeProvider>

              <button className="btn btn-primary" type="submit">
                <span className="glyphicon glyphicon-search" />
              </button>
            </div>
          </React.Fragment>
        )}
      </SearchBarLayout>
    );
  }
);
SearchBar.displayName = 'SearchBar';
export default SearchBar;
