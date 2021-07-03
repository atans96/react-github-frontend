import React, { useCallback, useEffect, useRef, useState } from 'react';
import './index.scss';
import ReactDOM from 'react-dom';
import './hamburgers.css';
import { BrowserRouter as Router, Redirect, useHistory, useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import { ApolloClient, ApolloLink, getApolloContext, HttpLink, InMemoryCache, useApolloClient } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { allowedRoutes, readEnvironmentVariable } from './util';
import { logoutAction } from './util/util';
import { getFile, getTokenGQL, getValidGQLProperties, session } from './services';
import { StarRankingContainer, SuggestedRepoContainer, SuggestedRepoImagesContainer } from './selectors/stateSelector';
import KeepMountedLayout from './Layout/KeepMountedLayout';
import {
  StateDiscoverProvider,
  StateProvider,
  StateSharedProvider,
  useTrackedStateShared,
} from './selectors/stateContextSelector';
import { useApolloFactory } from './hooks/useApolloFactory';
import { If } from './util/react-if/If';
import { Then } from './util/react-if/Then';
import { createRenderElement } from './Layout/MasonryLayout';
import ComposeProviders from './Layout/ComposeProviders';
import { LoadingBig } from './LoadingBig';
import { loadable } from './loadable';

const HomeRenderer = (condition: boolean) =>
  loadable({
    importFn: () => import('./HomeRenderer').then((module) => createRenderElement(module.default, {})),
    cacheId: 'HomeRenderer',
    condition: condition,
    loading: () => LoadingBig,
    empty: () => <></>,
  });
const Login = (condition: boolean) =>
  loadable({
    importFn: () => import('./LoginRenderer').then((module) => createRenderElement(module.default, {})),
    cacheId: 'Login',
    condition: condition,
    loading: () => LoadingBig,
    empty: () => <></>,
    redirect: () => <Redirect to={'/404'} from={'/login'} />,
  });
const DiscoverRenderer = (condition: boolean) =>
  loadable({
    importFn: () => import('./DiscoverRenderer').then((module) => createRenderElement(module.default, {})),
    cacheId: 'DiscoverRenderer',
    condition: condition,
    loading: () => LoadingBig,
    empty: () => <></>,
    redirect: () => <Redirect to={'/login'} from={'/discover'} />,
  });
const Details = (condition: boolean) =>
  loadable({
    importFn: () => import('./Details'),
    cacheId: 'Details',
    condition: condition,
    empty: () => <></>,
    redirect: () => <Redirect to={'/login'} from={'/detail/:id'} />,
  });
const ManageProfile = (condition: boolean) =>
  loadable({
    importFn: () => import('./ManageProfile').then((module) => createRenderElement(module.default, {})),
    cacheId: 'ManageProfile',
    condition: condition,
    loading: () => LoadingBig,
    empty: () => <></>,
    redirect: () => <Redirect to={'/login'} from={'/profile'} />,
  });
const NotFound = (condition: boolean) =>
  loadable({
    importFn: () => import('./NotFound'),
    cacheId: 'NotFound',
    condition: condition,
    loading: () => LoadingBig,
    empty: () => <></>,
  });

// const ManageProfile = React.lazy(() => import('./ManageProfile'));
const rootEl = document.getElementById('root'); // from index.html <div id="root"></div>
const App = () => {
  const apolloCacheData = useRef<Object>({});
  const [, dispatchShared] = useTrackedStateShared();
  const [stateShared] = useTrackedStateShared();
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

  // useEffect(() => {
  //   if ('serviceWorker' in navigator && stateShared.isLoggedIn) {
  //     navigator.serviceWorker
  //       .register('sw.js')
  //       .then(() => navigator.serviceWorker.ready)
  //       .then((reg) => {
  //         reg.onupdatefound = () => {
  //           const waitingServiceWorker = reg.waiting;
  //           if (waitingServiceWorker) {
  //             waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
  //           }
  //         };
  //         // eslint-disable-next-line  @typescript-eslint/no-unused-expressions
  //         navigator?.serviceWorker?.controller?.postMessage({
  //           type: 'username',
  //           username: stateShared.username,
  //         });
  //         return (window.onbeforeunload = () => {
  //           session(true).then(noop);
  //           // you cannot use reg.sync here as it returns Promise but we need to immediately close window tab when X is clicked
  //           // eslint-disable-next-line  @typescript-eslint/no-unused-expressions
  //           navigator?.serviceWorker?.controller?.postMessage({
  //             type: 'apolloCacheData',
  //             cacheData: apolloCacheData,
  //           });
  //           // eslint-disable-next-line  @typescript-eslint/no-unused-expressions
  //           navigator?.serviceWorker?.controller?.postMessage({
  //             type: 'execute',
  //           });
  //           return window.close();
  //         });
  //       });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [stateShared.isLoggedIn, apolloCacheData]);

  useEffect(() => {
    getFile('languages.json').then((githubLanguages) => {
      dispatchShared({
        type: 'SET_GITHUB_LANGUAGES',
        payload: {
          githubLanguages,
        },
      });
    });
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
    session(false).then((data) => {
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
  const [clickedNavBar, setClickedNavBar] = useState('');
  const ClickedNavBar = useCallback((value: string) => setClickedNavBar(value), []);
  return (
    <div>
      <KeepMountedLayout
        mountedCondition={true}
        render={() => {
          return createRenderElement(NavBar, { ClickedNavBar });
        }}
      />
      <If condition={loadingUserStarred && seenDataLoading}>
        <Then>
          <LoadingBig />
        </Then>
      </If>
      <If condition={!loadingUserStarred && !seenDataLoading && !errorUserStarred && !seenDataError}>
        <Then>
          {HomeRenderer(!stateShared.isLoggedIn && clickedNavBar === 'Home')}
          {Login(!stateShared.isLoggedIn && clickedNavBar === 'Login')}
          {DiscoverRenderer(stateShared.isLoggedIn && clickedNavBar === 'Discover')}
          {Details(clickedNavBar === 'Details')}
          {ManageProfile(stateShared.isLoggedIn && clickedNavBar === 'ManageProfile')}
          {NotFound(allowedRoutes.includes(location.pathname))}
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
      uri: `${readEnvironmentVariable('GRAPHQL_ADDRESS')}/graphql`,
      headers: { origin: `http://localhost:3000` },
      fetchOptions: {
        credentials: 'include',
      },
    });
    const authLink = setContext((_, { headers, query, ...context }) => {
      return {
        headers: {
          ...headers,
        },
        query: {
          ...query,
          username: stateShared.username,
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
            } else if (message.includes('Unauthorized')) {
              unAuthorizedAction();
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
        authLink.concat(mongoGateway)
      ),
    ]);
    return new ApolloClient({
      link: link,
      cache: cache,
    });
  }, [stateShared.username, stateShared.isLoggedIn]);

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
