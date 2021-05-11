import React, { useCallback, useEffect, useRef } from 'react';
import './index.scss';
import ReactDOM from 'react-dom';
import './hamburgers.css';
import { BrowserRouter as Router, Redirect, useHistory, useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import { ApolloClient, ApolloLink, getApolloContext, HttpLink, InMemoryCache, useApolloClient } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import CryptoJS from 'crypto-js';
import { allowedRoutes, fastFilter, readEnvironmentVariable } from './util';
import { filterActionResolvedPromiseData, logoutAction, noop } from './util/util';
import { getTokenGQL, getValidGQLProperties } from './services';
import {
  alreadySeenCardSelector,
  StarRankingContainer,
  SuggestedRepoContainer,
  SuggestedRepoImagesContainer,
} from './selectors/stateSelector';
import KeepMountedLayout from './Layout/KeepMountedLayout';
import SearchBar from './SearchBar';
import Home from './Home';
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
import { LanguagePreference, MergedDataProps } from './typing/type';
import { IDataOne } from './typing/interface';
import { If } from './util/react-if/If';
import eye from './new_16-2.gif';
import { Then } from './util/react-if/Then';
import loadable from '@loadable/component';
import { createRenderElement } from './Layout/MasonryLayout';
import NotFound from './NotFound';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
import ComposeProviders from './Layout/ComposeProviders';
// const ManageProfile = React.lazy(() => import('./ManageProfile'));
const Discover = loadable(() => import('./Discover'));
const ManageProfile = loadable(() => import('./ManageProfile'));
const SearchBarDiscover = loadable(() => import('./SearchBarDiscover'));
const Login = loadable(() => import('./Login'));
const Details = loadable(() => import('./Details'));
const rootEl = document.getElementById('root'); // from index.html <div id="root"></div>

let apolloCacheData = {};

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
  const { userStarred, loadingUserStarred, errorUserStarred } = useApolloFactory(
    Function.name
  ).query.getUserInfoStarred();
  const { seenData, seenDataLoading, seenDataError } = useApolloFactory(Function.name).query.getSeen();
  const alreadySeenCards: number[] = React.useMemo(() => {
    //Every time Global re-renders and nothing is memoized because each render re creates the selector.
    // To solve this we can use React.useMemo. Here is the correct way to use createSelectItemById.
    return alreadySeenCardSelector(seenData?.getSeen?.seenCards ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seenData?.getSeen?.seenCards]);

  const languagePreference = React.useMemo(() => {
    return new Map(
      idx(userData, (_) => _.getUserData.languagePreference.map((obj: LanguagePreference) => [obj.language, obj])) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx(userData, (_) => _.getUserData.languagePreference)]);

  const languagePreferenceRef = useRef(languagePreference);
  const userStarredRef = useRef(userStarred?.getUserInfoStarred?.starred);
  const alreadySeenCardsRef = useRef<number[]>([]);
  useEffect(() => {
    let isFinished = false;
    if (!isFinished && ['/', '/discover'].includes(location.pathname)) {
      alreadySeenCardsRef.current = [...alreadySeenCards];
      return () => {
        isFinished = true;
      };
    }
  });
  useEffect(() => {
    let isFinished = false;
    if (!isFinished && ['/', '/discover'].includes(location.pathname)) {
      languagePreferenceRef.current = languagePreference;
      return () => {
        isFinished = true;
      };
    }
  });
  useEffect(() => {
    let isFinished = false;
    if (!isFinished && ['/', '/discover'].includes(location.pathname)) {
      userStarredRef.current = userStarred?.getUserInfoStarred?.starred;
      return () => {
        isFinished = true;
      };
    }
  });

  const actionAppend = (data: IDataOne | any, displayName: string) => {
    if (state.filterBySeen && !loadingUserStarred && !seenDataLoading && !errorUserStarred && !seenDataError) {
      return new Promise(function (resolve, reject) {
        switch (displayName) {
          case displayName.match(/^discover/gi) && displayName!.match(/^discover/gi)![0].length > 0
            ? displayName
            : undefined: {
            let filter1 = fastFilter(
              (obj: MergedDataProps) =>
                filterActionResolvedPromiseData(
                  obj,
                  !alreadySeenCardsRef?.current?.includes(obj.id) && !userStarredRef?.current?.includes(obj.id),
                  !!languagePreferenceRef?.current?.get(obj.language)?.checked
                ),
              data
            );
            if (filter1.length > 0) {
              dispatchDiscover({
                type: 'MERGED_DATA_APPEND_DISCOVER',
                payload: {
                  data: filter1,
                },
              });
            } else if (filter1.length === 0) {
              dispatchDiscover({
                type: 'ADVANCE_PAGE_DISCOVER',
              });
            }
            resolve();
            break;
          }
          case 'Home': {
            const filter1 = fastFilter(
              (obj: MergedDataProps) =>
                filterActionResolvedPromiseData(
                  obj,
                  !alreadySeenCardsRef?.current?.includes(obj.id),
                  !!languagePreferenceRef?.current?.get(obj.language)
                ),
              data.dataOne
            );
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
            resolve();
            break;
          }
          default: {
            throw new Error('No valid component found!');
          }
        }
      });
    }
  };
  const actionResolvePromise = useCallback(
    ({
      action,
      data = undefined,
      setLoading,
      isFetchFinish,
      displayName,
      setNotification,
      error = undefined,
      prefetch = noop,
    }) => {
      if (!loadingUserStarred && !errorUserStarred && !seenDataLoading && !seenDataError) {
        setLoading(false);
        if (data && action === 'append') {
          actionAppend(data, displayName)!.then(() => prefetch());
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
      }
      return { isFetchFinish };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stateShared.username, userStarred, loadingUserStarred, errorUserStarred, seenDataLoading, seenDataError]
  );
  const cacheData: any = useApolloClient().cache.extract();
  useEffect(() => {
    if (cacheData.ROOT_QUERY && Object.keys(cacheData.ROOT_QUERY).length > 0) {
      apolloCacheData = cacheData.ROOT_QUERY;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheData]);

  useEffect(() => {
    if ('serviceWorker' in navigator && stateShared.isLoggedIn) {
      navigator.serviceWorker
        .register('sw.js')
        .then(() => navigator.serviceWorker.ready)
        .then((reg) => {
          reg.onupdatefound = () => {
            const waitingServiceWorker = reg.waiting;
            if (waitingServiceWorker) {
              waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          };
          // eslint-disable-next-line  @typescript-eslint/no-unused-expressions
          navigator?.serviceWorker?.controller?.postMessage({
            type: 'username',
            username: `${CryptoJS.TripleDES.decrypt(
              localStorage.getItem('jbb') || '',
              readEnvironmentVariable('CRYPTO_SECRET')!
            ).toString(CryptoJS.enc.Latin1)}`,
          });
          return (window.onbeforeunload = () => {
            // you cannot use reg.sync here as it returns Promise but we need to immediately close window tab when X is clicked
            // eslint-disable-next-line  @typescript-eslint/no-unused-expressions
            navigator?.serviceWorker?.controller?.postMessage({
              type: 'apolloCacheData',
              cacheData: apolloCacheData,
            });
            // eslint-disable-next-line  @typescript-eslint/no-unused-expressions
            navigator?.serviceWorker?.controller?.postMessage({
              type: 'execute',
            });
            return window.close();
          });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateShared.isLoggedIn, apolloCacheData]);

  return (
    <div>
      <KeepMountedLayout
        mountedCondition={true}
        render={() => {
          return createRenderElement(NavBar, {});
        }}
      />
      <If condition={loadingUserStarred && seenDataLoading}>
        <Then>
          <div style={{ textAlign: 'center' }}>
            <img src={eye} style={{ width: '100px' }} />
            <div style={{ textAlign: 'center' }}>
              <h3>Please wait while fetching your data</h3>
            </div>
          </div>
        </Then>
      </If>
      <If condition={!loadingUserStarred && !seenDataLoading && !errorUserStarred && !seenDataError}>
        <Then>
          <KeepMountedLayout
            mountedCondition={location.pathname === '/profile'}
            render={() => {
              if (stateShared.isLoggedIn) {
                return createRenderElement(ManageProfile, {});
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
                  {createRenderElement(SearchBar, {})}
                  {createRenderElement(Home, { actionResolvePromise })}
                </StateStargazersProvider>
              );
            }}
          />

          <KeepMountedLayout
            mountedCondition={/detail/.test(location.pathname)}
            render={() => {
              if (stateShared.isLoggedIn) {
                return createRenderElement(Details, {});
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
                    {createRenderElement(SearchBarDiscover, {})}
                    {createRenderElement(Discover, { actionResolvePromise })}
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
                return <StateRateLimitProvider>{createRenderElement(Login, {})}</StateRateLimitProvider>;
              } else {
                return <Redirect to={'/'} from={'/login'} />;
              }
            }}
          />
          <KeepMountedLayout
            mountedCondition={!/detail/.test(location.pathname) && !allowedRoutes.includes(location.pathname)}
            render={() => {
              return <NotFound />;
            }}
          />
        </Then>
      </If>
    </div>
  );
};
const CustomApolloProvider = ({ children }: any) => {
  const history = useHistory();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const unAuthorizedAction = () => {
    logoutAction(history, dispatchShared);
    window.alert('Your token has expired. We will logout you out.');
  };

  const isLoggedInRef = useRef(stateShared.isLoggedIn);
  useEffect(() => {
    isLoggedInRef.current = stateShared.isLoggedIn;
  });
  const clientWrapped = useCallback(() => {
    // const httpLink = new HttpLink({
    //   uri: 'https://api.github.com/graphql',
    //   headers: {
    //     Authorization: `Bearer ${stateShared.tokenGQL}`,
    //   },
    // });
    // const wsLink = new WebSocketLink({
    //   uri: readEnvironmentVariable('WS_LINK') || ('' as string),
    //   options: {
    //     reconnect: true,
    //   },
    // });
    // const githubGateway = ApolloLink.split(
    //   ({ query }) => {
    //     const { kind, operation } = getMainDefinition(query) as any;
    //     return kind === 'OperationDefinition' && operation === 'subscription';
    //   }, // Routes the query to the proper client
    //   wsLink,
    //   httpLink
    // );
    const githubGateway = new HttpLink({
      uri: 'https://api.github.com/graphql',
      headers: {
        Authorization: `Bearer ${stateShared.tokenGQL}`,
      },
    });
    // Create Second Link for appending data to MongoDB using GQL
    const mongoGateway = new HttpLink({
      uri: `http://localhost:${process.env.SERVER_PORT || 5000}/graphql`,
      fetchOptions: {
        credentials: 'include',
      },
    });
    const authLink = setContext((_, { headers, query, ...context }) => {
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
    });
    const cache = new InMemoryCache({
      addTypename: false,
      typePolicies: {
        Query: {
          fields: {
            getSeen: {
              merge(existing, incoming) {
                return incoming;
              },
            },
            getUserInfoData: {
              merge(existing, incoming) {
                return incoming;
              },
            },
            getUserInfoStarred: {
              merge(existing, incoming) {
                return incoming;
              },
            },
            getUserData: {
              merge(existing, incoming) {
                return incoming;
              },
            },
            repository: {
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
              unAuthorizedAction();
            }
          });
        }
        if (networkError) {
          console.log('Network Error: ', networkError);
          if ('result' in networkError && networkError.result.message === 'TokenExpiredError') {
            unAuthorizedAction();
          }
        }
      }),
      ApolloLink.split(
        //returns true for the first link and false for the second link
        (operation) => operation.getContext().clientName === 'github',
        githubGateway,
        authLink.concat(mongoGateway)
      ),
    ]);
    return new ApolloClient({
      link: link,
      cache: cache,
    });
  }, [stateShared.tokenGQL, localStorage.getItem('sess')]);

  const ApolloContext = getApolloContext();
  const value = React.useMemo(
    () => ({ client: clientWrapped() }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stateShared.tokenGQL, localStorage.getItem('sess')]
  );
  return <ApolloContext.Provider value={value}>{children}</ApolloContext.Provider>;
};

const Main = () => {
  //make sure that SuggestedRepoImagesContainer.Provider is below CustomApolloProvider since it's using ApolloContext.Provider in order to use useQuery hook
  return (
    <Router>
      <StateProvider>
        <StateDiscoverProvider>
          <StateSharedProvider>
            <CustomApolloProvider>
              <ComposeProviders
                components={[
                  SuggestedRepoImagesContainer.Provider,
                  SuggestedRepoContainer.Provider,
                  StarRankingContainer.Provider,
                ]}
              >
                <App />
              </ComposeProviders>
            </CustomApolloProvider>
          </StateSharedProvider>
        </StateDiscoverProvider>
      </StateProvider>
    </Router>
  );
};
ReactDOM.render(<Main />, rootEl);
