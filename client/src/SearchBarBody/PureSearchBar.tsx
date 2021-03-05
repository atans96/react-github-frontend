import React, { useCallback, useEffect, useRef, useState } from 'react';
import { dispatchLoading, dispatchPerPage, dispatchUsername, dispatchVisible } from '../store/dispatcher';
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
import { MergedDataProps, StargazerProps } from '../typing/type';
import { Then } from '../util/react-if/Then';
import { If } from '../util/react-if/If';
import useCollapse from '../hooks/useCollapse';
import clsx from 'clsx';
import { IState, IStateStargazers } from '../typing/interface';
import Result from './PureSearchBarBody/ResultsBody/Result';
import { Typography } from '@material-ui/core';
import { useUserCardStyles } from '../HomeBody/CardBody/UserCardStyle';
import HistoryIcon from '@material-ui/icons/History';
import { Loading } from '../util';
import useApolloFactory from '../hooks/useApolloFactory';

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
  state: IState;
  stateStargazers: IStateStargazers;
  dispatch: any;
  dispatchStargazersUser: any;
}

const SearchBar = React.memo<SearchBarProps>(
  ({ portalExpandable, dispatch, dispatchStargazersUser, state, stateStargazers }) => {
    const { query, mutation } = useApolloFactory();
    const { searchesData } = query.getSearchesData;
    const username = useRef<any>();
    const classes = useUserCardStyles({ avatarSize: 20 });
    const size = {
      width: '500px',
      minWidth: '100px',
      maxWidth: '100%',
    };
    let style: React.CSSProperties;
    if (state.width < 711) {
      style = { width: `${state.width - 200}px` };
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
        We will fetch ${state.perPage} pages per scroll based on your setting.`;
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
      if (username.current.getState() !== '') {
        dispatchUsername([...usernameList, username.current.getState()], dispatch);
      } else {
        dispatchUsername(usernameList, dispatch);
      }
      dispatch({
        type: 'REMOVE_ALL',
      });
      dispatchStargazersUser({
        type: 'REMOVE_ALL',
      });
      dispatchStargazersUser({
        type: 'REMOVE_QUEUE',
      });
      setVisible(false);
      setVisibleSearchesHistory(false);
      if (state.isLoggedIn) {
        mutation
          .searchesAdded({
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
          })
          .then(() => {});
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
      dispatchStargazersUser({
        type: 'REMOVE_ALL',
      });
      dispatchStargazersUser({
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
          filterBySeen: !state.filterBySeen,
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
              defaultValue={state.perPage}
              dispatcher={dispatchPerPage}
              dispatch={dispatch}
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
            {state.topics.map((obj, idx) => {
              if (renderTopicTags) {
                return <Tags key={idx} obj={obj} clicked={obj.clicked} state={state} dispatch={dispatch} />;
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
      if (state.filteredTopics.length > 0) {
        dispatch({
          type: 'MERGED_DATA_FILTER_BY_TAGS',
          payload: {
            filteredMergedData: state.mergedData.filter((x) => {
              const topics = [...x.topics];
              if (x.language) {
                topics.push(x.language.toLowerCase());
              }
              return _.intersection(topics, state.filteredTopics).length > 0;
              // return _.intersection(topics, state.filteredTopics).length === state.filteredTopics.length;
            }),
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.filteredMergedData]);

    useEffect(() => {
      return () => {
        dispatchVisible(false, dispatch);
        dispatchLoading(false, dispatch);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useClickOutside(resultsRef, () => {
      setVisible(false);
      setVisibleSearchesHistory(false);
      dispatchVisible(false, dispatch);
    });
    const filter = (searchesHistory: any[] | undefined, valueRef: string) => {
      let result: any[] = [];
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
      <SearchBarLayout style={{ width: `${state.width} px` }} onSubmit={handleSubmit}>
        {(portal) => (
          <React.Fragment>
            {renderSlider && spawnSlider(portal)}
            {renderTopicTags && spawnTopicTags()}
            {/* we separate this as new component since UI need to be updated as soon as possible
            thus causing heavy rendering. To prevent setState takes effect of rendering the children component
            to Home.tsx, we put it in new component */}
            <PureInput
              setVisible={setVisible}
              stateStargazers={stateStargazers}
              visibleSearchesHistory={visibleSearchesHistory}
              setVisibleSearchesHistory={setVisibleSearchesHistory}
              style={style}
              state={state}
              dispatch={dispatch}
              handleChange={handleChange}
              searchesHistory={searchesData?.getSearches}
              ref={username}
              dispatchStargazersUser={dispatchStargazersUser}
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
                      .map((search: any, idx: number) => {
                        const newBody = search.search.replace(
                          new RegExp(valueRef.toLowerCase(), 'gi'),
                          (match: any) => `<mark style="background: #2769AA; color: white;">${match}</mark>`
                        );
                        return (
                          <Result state={state} getRootProps={getRootProps} userName={search.search} key={idx}>
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
                        {state.searchUsers
                          .filter((search) => {
                            const temp =
                              searchesData?.getSearches?.reduce((acc: any, obj: any) => {
                                acc.push(obj.search);
                                return acc;
                              }, []) || [];
                            return !temp.includes(Object.keys(search)[0]);
                          })
                          .map((result, idx) => (
                            <Result
                              state={state}
                              getRootProps={getRootProps}
                              userName={Object.keys(result).toString()}
                              key={idx}
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
                  state={state}
                  getRootProps={getRootProps}
                  data={state.searchUsers}
                  isLoading={state.isLoading}
                  style={style}
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
                  <Tooltip title={showTipsText(state.mergedData.length > 0 ? 'filterTags' : 'noData')}>
                    <div
                      {...toogleTopicTags({
                        onClick: handleClickSearchTopicTags,
                        disabled: state.mergedData.length > 0 ? false : true,
                      })}
                      className={clsx('btn', {
                        'btn-success': renderTopicTags,
                        'btn-default': !renderTopicTags,
                      })}
                      style={state.mergedData.length > 0 ? { cursor: 'pointer' } : { cursor: 'not-allowed' }}
                    >
                      <span className="glyphicon glyphicon-tags" />
                    </div>
                  </Tooltip>
                </MuiThemeProvider>
              </MuiThemeProvider>

              <MuiThemeProvider theme={defaultTheme}>
                <MuiThemeProvider theme={theme}>
                  <If condition={state.isLoggedIn}>
                    <Then>
                      <Tooltip title={showTipsText(`${state.filterBySeen ? 'noFilterSeen' : 'filterSeen'}`)}>
                        <div onClick={handleClickFilterSeenCards} className="btn" style={{ cursor: 'pointer' }}>
                          <span
                            className={`glyphicon ${state.filterBySeen ? 'glyphicon-eye-close' : 'glyphicon-eye-open'}`}
                          />
                        </div>
                      </Tooltip>
                    </Then>
                  </If>
                  <If condition={!state.isLoggedIn}>
                    <Then>
                      <Tooltip title={showTipsText(`login`)}>
                        <div className="btn" style={{ cursor: 'not-allowed', opacity: 0.6 }}>
                          <span
                            className={`glyphicon ${state.filterBySeen ? 'glyphicon-eye-close' : 'glyphicon-eye-open'}`}
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
export default SearchBar;
