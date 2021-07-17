import React, { useEffect, useRef } from 'react';
import './index.scss';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import { ApolloClient, ApolloLink, getApolloContext, InMemoryCache, useApolloClient } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { readEnvironmentVariable, useStableCallback } from './util';
import { logoutAction, noop } from './util/util';
import { endOfSession, getFile, getTokenGQL, getValidGQLProperties, session } from './services';
import { StarRankingContainer, SuggestedRepoContainer, SuggestedRepoImagesContainer } from './selectors/stateSelector';
import KeepMountedLayout from './Layout/KeepMountedLayout';
import {
  StateDiscoverProvider,
  StateProvider,
  StateRateLimitProvider,
  StateSharedProvider,
  StateStargazersProvider,
  useTrackedStateShared,
} from './selectors/stateContextSelector';
import { useApolloFactory } from './hooks/useApolloFactory';
import { If } from './util/react-if/If';
import { Then } from './util/react-if/Then';
import ComposeProviders from './Layout/ComposeProviders';
import { LoadingBig } from './LoadingBig';
import Loadable from 'react-loadable';
import { shallowEqual } from 'fast-equals';
import { ShouldRender } from './typing/enum';
import sysend from 'sysend';
import DbCtx from './db/db.ctx';
import { HttpLink } from './link/http/HttpLink';

const Home = Loadable({
  loading: LoadingBig,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "Home" */ './Home'),
});
const Login = Loadable({
  loading: LoadingBig,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "Login" */ './Login'),
});
const LoginLoadable = () => {
  return (
    <StateRateLimitProvider>
      <Login />
    </StateRateLimitProvider>
  );
};
const Discover = Loadable({
  loading: LoadingBig,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "Discover" */ './Discover'),
});
const SearchBarDiscover = Loadable({
  loading: LoadingBig,
  delay: 300,
  loader: () => import(/* webpackChunkName: "SearchBarDiscover" */ './SearchBarDiscover'),
});
const PaginationBarDiscover = Loadable({
  loading: LoadingBig,
  delay: 300,
  loader: () => import(/* webpackChunkName: "PaginationBarDiscover" */ './DiscoverBody/PaginationBarDiscover'),
});
const Details = Loadable({
  loading: LoadingBig,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "Details" */ './Details'),
});
const ManageProfile = Loadable({
  loading: LoadingBig,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "ManageProfile" */ './ManageProfile'),
});

const NotFound = Loadable({
  loading: LoadingBig,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "NotFound" */ './NotFound'),
});
const SearchBar = Loadable({
  loading: LoadingBig,
  delay: 300,
  loader: () => import(/* webpackChunkName: "SearchBar" */ './SearchBar'),
});

// const ManageProfile = React.lazy(() => import('./ManageProfile'));
const rootEl = document.getElementById('root'); // from index.html <div id="root"></div>
interface AppRoutes {
  loadingUserStarred: boolean;
  seenDataError: any;
  seenDataLoading: any;
  errorUserStarred: any;
  shouldRender: string;
  isLoggedIn: boolean;
}
const AppRoutes = React.memo(
  ({ loadingUserStarred, seenDataLoading, errorUserStarred, seenDataError, shouldRender, isLoggedIn }: AppRoutes) => {
    return (
      <>
        <NavBar />
        <If condition={!loadingUserStarred && !seenDataLoading && !errorUserStarred && !seenDataError}>
          <Then>
            <Switch>
              <Route
                path="/"
                exact
                render={() => (
                  <>
                    <StateStargazersProvider>
                      <SearchBar />
                    </StateStargazersProvider>
                    <KeepMountedLayout
                      mountedCondition={shouldRender === ShouldRender.Home}
                      render={() => (
                        <StateStargazersProvider>
                          <Home />
                        </StateStargazersProvider>
                      )}
                    />
                  </>
                )}
              />
              <Route path="/login" exact component={LoginLoadable} />
              <Route
                path="/discover"
                exact
                render={() =>
                  isLoggedIn && (
                    <KeepMountedLayout
                      mountedCondition={shouldRender === ShouldRender.Discover}
                      render={() => (
                        <StateStargazersProvider>
                          <SearchBarDiscover />
                          <Discover />
                          <PaginationBarDiscover />
                        </StateStargazersProvider>
                      )}
                    />
                  )
                }
              />
              <Route path="/detail/:id" exact component={Details} />
              <Route
                path="/profile"
                exact
                render={() =>
                  isLoggedIn && (
                    <KeepMountedLayout
                      mountedCondition={shouldRender === ShouldRender.Profile}
                      render={() => <ManageProfile />}
                    />
                  )
                }
              />
              <Route path="*" exact render={() => <NotFound />} />
            </Switch>
          </Then>
        </If>
      </>
    );
  },
  (prevProps, nextProps) => {
    return shallowEqual(prevProps, nextProps);
  }
);
const MiddleAppRoute = () => {
  const { db, clear } = DbCtx.useContainer();
  const apolloCacheData = useRef<Object>({});
  const [, dispatchShared] = useTrackedStateShared();
  const [stateShared] = useTrackedStateShared();
  sysend.on('Login', function (fn) {
    dispatchShared({
      type: 'LOGIN',
      payload: { isLoggedIn: true },
    });
    dispatchShared({
      type: 'SET_USERNAME',
      payload: { username: fn.username },
    });
  });
  const location = useLocation();
  const { loadingUserStarred, errorUserStarred } = useApolloFactory(Function.name).query.getUserInfoStarred();
  const { seenDataLoading, seenDataError } = useApolloFactory(Function.name).query.getSeen();
  const cacheData: any = useApolloClient().cache.extract();
  useEffect(() => {
    if (cacheData.ROOT_QUERY && Object.keys(cacheData.ROOT_QUERY).length > 0) {
      apolloCacheData.current = cacheData.ROOT_QUERY;
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
            username: stateShared.username,
          });
          return (window.onbeforeunload = () => {
            // Promise.all([
            //   db.apolloCache.add({ data: JSON.stringify(apolloCacheData) }),
            //   endOfSession(stateShared.username, apolloCacheData),
            //   session(true),
            // ]).then(noop);
            return window.close();
          });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateShared.isLoggedIn, apolloCacheData]);

  useEffect(() => {
    getFile('languages.json').then((githubLanguages) => {
      dispatchShared({
        type: 'SET_GITHUB_LANGUAGES',
        payload: {
          githubLanguages,
        },
      });
    });
    if (stateShared.isLoggedIn) {
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
    session(false).then((data) => {
      if (!data.data) {
        localStorage.clear();
        clear();
      }
      dispatchShared({
        type: 'SET_USERNAME',
        payload: { username: data.username },
      });
      dispatchShared({
        type: 'LOGIN',
        payload: {
          isLoggedIn: data.data,
        },
      });
    });
  }, []);
  return (
    <AppRoutes
      errorUserStarred={errorUserStarred}
      isLoggedIn={stateShared.isLoggedIn}
      loadingUserStarred={loadingUserStarred}
      seenDataLoading={seenDataLoading}
      seenDataError={seenDataError}
      shouldRender={stateShared.shouldRender}
    />
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
  const clientWrapped = useStableCallback(() => {
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
    }) as unknown as ApolloLink;
    // Create Second Link for appending data to MongoDB using GQL
    const mongoGateway = new HttpLink({
      uri: `${readEnvironmentVariable('GRAPHQL_ADDRESS')}/graphql/`,
      headers: { origin: `https://localhost:3000` },
      fetchOptions: {
        credentials: 'include',
      },
    }) as unknown as ApolloLink;
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
            if (message.includes('property')) {
              let property: any = '';
              const messaages = message.split(' ');
              while (messaages) {
                const str = messaages.shift();
                if (str === 'property') {
                  property = messaages.shift()!.match(/'(.*?)'/)![1];
                  break;
                }
              }
              console.log(`[GraphQL error]: Message: ${message}, Path: ${path}`);
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
              }
            } else {
              throw new Error(message);
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
        mongoGateway
      ),
    ]);
    return new ApolloClient({
      link: link,
      cache: cache,
    });
  });

  const ApolloContext = getApolloContext();
  const value = React.useMemo(
    () => ({ client: clientWrapped() }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stateShared.tokenGQL, stateShared.isLoggedIn]
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
                  DbCtx.Provider,
                ]}
              >
                <MiddleAppRoute />
              </ComposeProviders>
            </CustomApolloProvider>
          </StateSharedProvider>
        </StateDiscoverProvider>
      </StateProvider>
    </Router>
  );
};
ReactDOM.render(<Main />, rootEl);
