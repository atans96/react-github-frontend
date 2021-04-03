import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import './index.scss';
import ReactDOM from 'react-dom';
import './hamburgers.css';
import { BrowserRouter as Router, Redirect, Route, Switch, useLocation, useHistory } from 'react-router-dom';
import NavBar from './NavBar';
import { ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import CryptoJS from 'crypto-js';
import { fastFilter, readEnvironmentVariable } from './util';
import { filterActionResolvedPromiseData, logoutAction } from './util/util';
import { getTokenGQL, getValidGQLProperties } from './services';
import {
  alreadySeenCardSelector,
  StarRankingContainer,
  SuggestedRepoContainer,
  SuggestedRepoImagesContainer,
} from './selectors/stateSelector';
import { initialStateShared, reducerShared } from './store/Shared/reducer';
import Login from './Login';
import ManageProfile from './ManageProfile';
import SearchBarDiscover from './SearchBarDiscover';
import Discover from './Discover';
import KeepMountedLayout from './Layout/KeepMountedLayout';
import SearchBar from './SearchBar';
import Home from './Home';
import Details from './Details';
import {
  StateDiscoverProvider,
  StateProvider,
  StateRateLimitProvider,
  StateSharedProvider,
  StateStargazersProvider,
  useTrackedState,
  useTrackedStateDiscover,
  useTrackedStateShared,
} from './selectors/stateContextSelector';
import useUserVerification from './hooks/useUserVerification';
import { useApolloFactory } from './hooks/useApolloFactory';
import idx from 'idx';
import { ActionResolvedPromise, LanguagePreference, MergedDataProps, Nullable } from './typing/type';
import { IDataOne } from './typing/interface';

const rootEl = document.getElementById('root'); // from index.html <div id="root"></div>

interface Output {
  isFetchFinish: boolean;
}
export interface ActionResolvePromiseOutput {
  actionResolvedPromise: (
    action: ActionResolvedPromise,
    setLoading: any,
    setNotification: any,
    isFetchFinish: boolean,
    displayName: string,
    data?: Nullable<IDataOne | any>,
    error?: string
  ) => Output;
}

const App = () => {
  const location = useLocation();
  const [state, dispatch] = useTrackedState();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [, dispatchDiscover] = useTrackedStateDiscover();
  const { verifiedLoading, username } = useUserVerification(dispatchShared);
  useEffect(() => {
    if (!stateShared.isLoggedIn) {
      dispatchShared({
        type: 'LOGIN',
        payload: {
          isLoggedIn: !verifiedLoading && username !== '',
        },
      });
    }
    if (!verifiedLoading && username !== '') {
      getTokenGQL().then((res) => {
        if (res.tokenGQL) {
          dispatchShared({
            type: 'TOKEN_ADDED',
            payload: {
              tokenGQL: res.tokenGQL,
            },
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedLoading, username, stateShared.isLoggedIn, stateShared.tokenGQL]);

  const { userData } = useApolloFactory(Function.name).query.getUserData();
  const { userStarred, loadingUserStarred } = useApolloFactory(Function.name).query.getUserInfoStarred();
  const { seenData } = useApolloFactory(Function.name).query.getSeen();
  const alreadySeenCards: number[] = React.useMemo(() => {
    //Every time Global re-renders and nothing is memoized because each render re creates the selector.
    // To solve this we can use React.useMemo. Here is the correct way to use createSelectItemById.
    return alreadySeenCardSelector(seenData?.getSeen?.seenCards ?? []);
  }, [seenData?.getSeen?.seenCards]);

  const languagePreference = React.useMemo(() => {
    return new Map(
      idx(userData, (_) => _.getUserData.languagePreference.map((obj: LanguagePreference) => [obj.language, obj])) || []
    );
  }, [idx(userData, (_) => _.getUserData.languagePreference)]);

  const languagePreferenceRef = useRef(languagePreference);
  const alreadySeenCardsRef = useRef(alreadySeenCards);
  useEffect(() => {
    alreadySeenCardsRef.current = alreadySeenCards;
  });
  useEffect(() => {
    languagePreferenceRef.current = languagePreference;
  });

  const actionAppend = (data: IDataOne | any, displayName: string) => {
    if (state.filterBySeen) {
      switch (displayName) {
        case displayName.match(/^discover/gi) && displayName!.match(/^discover/gi)![0].length > 0
          ? displayName
          : undefined: {
          let filter1 = fastFilter(
            (obj: MergedDataProps) =>
              filterActionResolvedPromiseData(
                obj,
                !alreadySeenCardsRef.current.includes(obj.id),
                languagePreferenceRef.current.get(obj.language),
                userStarred?.getUserInfoStarred?.starred?.includes(obj.id) === false
              ),
            data
          );

          let inputForImagesData = [];
          if (filter1.length > 0) {
            dispatchDiscover({
              type: 'MERGED_DATA_APPEND_DISCOVER',
              payload: {
                data: filter1,
              },
            });
            inputForImagesData = filter1.reduce((acc: any[], object: MergedDataProps) => {
              acc.push(
                Object.assign(
                  {},
                  {
                    id: object.id,
                    value: {
                      full_name: object.full_name,
                      branch: object.default_branch,
                    },
                  }
                )
              );
              return acc;
            }, []);
          } else if (filter1.length === 0) {
            dispatchDiscover({
              type: 'ADVANCE_PAGE_DISCOVER',
            });
          }
          break;
        }
        case 'Home': {
          const filter1 = fastFilter(
            (obj: MergedDataProps) =>
              filterActionResolvedPromiseData(
                obj,
                !alreadySeenCardsRef.current.includes(obj.id),
                languagePreferenceRef.current.get(obj.language)
              ),
            data.dataOne
          );
          const tempImages = fastFilter(
            (obj: MergedDataProps) => !alreadySeenCardsRef.current.includes(obj.id),
            data.renderImages
          );
          if (tempImages.length === 0) {
            dispatch({
              type: 'IMAGES_DATA_ADDED',
              payload: {
                images: [],
              },
            });
          } else {
            dispatch({
              type: 'IMAGES_DATA_ADDED',
              payload: {
                images: tempImages,
              },
            });
          }
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
            if (data.renderImages.length === 0) {
              dispatch({
                type: 'IMAGES_DATA_ADDED',
                payload: {
                  images: [],
                },
              });
            } else {
              dispatch({
                type: 'IMAGES_DATA_ADDED',
                payload: {
                  images: data.renderImages,
                },
              });
            }
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
          break;
        }
        default: {
          throw new Error('No valid component found!');
        }
      }
    }
  };

  const actionNonAppend = (data: IDataOne | any, displayName: string) => {
    switch (displayName) {
      case (displayName.match(/^discover/gi) || {}).input: {
      }
    }
  };
  const actionResolvePromise = useCallback(
    (
      action: ActionResolvedPromise,
      setLoading: any,
      setNotification: any,
      isFetchFinish: boolean,
      displayName: string,
      data?: Nullable<IDataOne | any>,
      error?: string
    ) => {
      setLoading(false);
      if (data && action === 'nonAppend') {
        actionNonAppend(data, displayName);
      }
      if (data && action === 'append') {
        actionAppend(data, displayName);
      }
      if (action === 'noData') {
        isFetchFinish = true;
        setNotification(`Sorry, no more data found for ${stateShared.username}`);
      }
      if (action === 'error' && error) {
        throw new Error(`Something wrong at ${displayName} ${error}`);
      }
      if (data && data.error_404) {
        setNotification(`Sorry, no data found for ${stateShared.username}`);
      } else if (data && data.error_403) {
        isFetchFinish = true;
        setNotification('Sorry, API rate limit exceeded.');
      } else if (data && data.error_message) {
        throw new Error(`Something wrong at ${displayName} ${data.error_message}`);
      }
      return { isFetchFinish };
    },
    [stateShared.username, userStarred, loadingUserStarred]
  );

  return (
    <div>
      <KeepMountedLayout
        mountedCondition={true}
        render={() => {
          return <NavBar />;
        }}
      />
      <KeepMountedLayout
        mountedCondition={location.pathname === '/profile'}
        render={() => {
          if (stateShared.isLoggedIn) {
            return <ManageProfile />;
          } else {
            return <Redirect to={'/login'} from={'/profile'} />;
          }
        }}
      />
      <KeepMountedLayout
        mountedCondition={location.pathname === '/'}
        render={() => {
          return (
            <StateStargazersProvider>
              <SearchBar />
              <Home actionResolvedPromise={actionResolvePromise} />
            </StateStargazersProvider>
          );
        }}
      />
      <KeepMountedLayout
        mountedCondition={/detail/.test(location.pathname)}
        render={() => {
          if (stateShared.isLoggedIn) {
            return <Details />;
          } else {
            return <Redirect to={'/login'} from={'/detail/:id'} />;
          }
        }}
      />
      <KeepMountedLayout
        mountedCondition={location.pathname === '/discover'}
        render={() => {
          if (stateShared.isLoggedIn) {
            return (
              <React.Fragment>
                <SearchBarDiscover />
                <Discover actionResolvedPromise={actionResolvePromise} />
              </React.Fragment>
            );
          } else {
            return <Redirect to={'/login'} from={'/discover'} />;
          }
        }}
      />
      <KeepMountedLayout
        mountedCondition={location.pathname === '/login'}
        render={() => {
          if (!stateShared.isLoggedIn) {
            return (
              <StateRateLimitProvider>
                <Login />
              </StateRateLimitProvider>
            );
          } else {
            return <Redirect to={'/'} from={'/login'} />;
          }
        }}
      />
      {/*<Switch>*/}
      {/*  <Route path={'/detail/:id'} exact component={Details} />*/}
      {/*</Switch>*/}
    </div>
  );
};
const Main = () => {
  const history = useHistory();
  const [stateShared, dispatchShared] = useReducer(reducerShared, initialStateShared);
  const isLoggedInRef = useRef(stateShared.isLoggedIn);
  useEffect(() => {
    isLoggedInRef.current = stateShared.isLoggedIn;
  });
  const clientWrapped = useCallback(() => {
    // Create First Link for querying data to external Github GQL API
    const githubGateway = new HttpLink({
      uri: 'https://api.github.com/graphql',
      headers: {
        Authorization: `Bearer ${stateShared.tokenGQL}`,
      },
    });
    // Create Second Link for appending data to MongoDB using GQL
    const mongoGateway = new HttpLink({
      uri: 'http://localhost:5000/graphql',
      fetchOptions: {
        credentials: 'include',
      },
    });
    const cache = new InMemoryCache({
      addTypename: false,
      typePolicies: {
        WatchUsers: {
          fields: {
            login: {
              merge(existing, incoming) {
                return incoming;
              },
            },
          },
        },
        Query: {
          fields: {
            getSeen: {
              merge(existing, incoming) {
                return incoming;
              },
            },
            getUserData: {
              merge(existing, incoming) {
                return incoming;
              },
            },
            getSearches: {
              merge(existing, incoming) {
                return incoming;
              },
            },
          },
        },
      },
    });
    const link = ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
          graphQLErrors.map(async ({ message, locations, path }) => {
            let property: any = '';
            const messaages = message.split(' ');
            while (messaages) {
              const str = messaages.shift();
              if (str === 'property') {
                property = messaages.shift()!.match(/'(.*?)'/)![1];
                break;
              }
            }
            console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
            const validGQLProperties = await getValidGQLProperties();
            if (
              property &&
              property.length > 0 &&
              validGQLProperties.data.includes(property) &&
              isLoggedInRef.current
            ) {
              // if no data exist when the user logged-in
              if (path) {
                dispatchShared({
                  type: 'NO_DATA_FETCH',
                  payload: {
                    path: path[0],
                  },
                });
              }
            } else if (message.includes('Unauthorized')) {
              logoutAction(history, dispatchShared);
            }
          });
        }
        if (networkError) {
          console.log('Network Error: ', networkError);
          if ('result' in networkError && networkError.result.message === 'TokenExpiredError') {
            localStorage.removeItem('sess');
            logoutAction(history, dispatchShared);
            window.alert('Your token has expired. We will logout you out.');
          }
        }
      }),
      setContext((_, { headers, query, ...context }) => {
        return {
          headers: {
            ...headers,
            ...(localStorage.getItem('sess') ? { authorization: localStorage.getItem('sess') } : {}),
          },
          query: {
            ...query,
            username: CryptoJS.TripleDES.decrypt(
              localStorage.getItem('jbb') || '',
              readEnvironmentVariable('CRYPTO_SECRET')!
            ).toString(CryptoJS.enc.Latin1),
          },
          ...context,
        };
      }),
      ApolloLink.split(
        //returns true for the first link and false for the second link
        (operation) => operation.getContext().clientName === 'github',
        githubGateway,
        mongoGateway
      ),
    ]);
    return new ApolloClient({
      link: link,
      cache: cache,
    });
  }, [stateShared.tokenGQL, localStorage.getItem('sess')]);

  return (
    <Router>
      <ApolloProvider client={clientWrapped()}>
        <SuggestedRepoImagesContainer.Provider>
          <SuggestedRepoContainer.Provider>
            <StarRankingContainer.Provider>
              <StateSharedProvider>
                <StateProvider>
                  <StateDiscoverProvider>
                    <App />
                  </StateDiscoverProvider>
                </StateProvider>
              </StateSharedProvider>
            </StarRankingContainer.Provider>
          </SuggestedRepoContainer.Provider>
        </SuggestedRepoImagesContainer.Provider>
      </ApolloProvider>
    </Router>
  );
};
ReactDOM.render(<Main />, rootEl);
