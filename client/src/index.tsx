import React, { useEffect } from 'react';
import './index.scss';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import { ApolloClient, ApolloLink, getApolloContext, InMemoryCache, useApolloClient } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { readEnvironmentVariable, urlBase64ToUint8Array, useStableCallback } from './util';
import { logoutAction, noop } from './util/util';
import { endOfSession, getFile, getTokenGQL, getValidGQLProperties, session, subscribeToApollo } from './services';
import { StarRankingContainer, SuggestedRepoContainer, SuggestedRepoImagesContainer } from './selectors/stateSelector';
import KeepMountedLayout from './Layout/KeepMountedLayout';
import {
  StateDiscoverProvider,
  StateProvider,
  StateSharedProvider,
  StateStargazersProvider,
  useTrackedStateShared,
} from './selectors/stateContextSelector';
import ComposeProviders from './Layout/ComposeProviders';
import Loadable from 'react-loadable';
import { shallowEqual } from 'fast-equals';
import { ShouldRender } from './typing/enum';
import sysend from 'sysend';
import DbCtx from './db/db.ctx';
import { HttpLink } from './link/http/HttpLink';
import Empty from './Layout/EmptyLayout';
import useWebSocket from './util/websocket';
import { associate } from './graphql/queries';
import { GraphQLUserData } from './typing/interface';
// import Login from './Login';
const channel = new BroadcastChannel('sw-messages');

const Home = Loadable({
  loading: Empty,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "Home" */ './Home'),
});
const Login = Loadable({
  loading: Empty,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "Login" */ './Login'),
});
const Discover = Loadable({
  loading: Empty,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "Discover" */ './Discover'),
});
const SearchBarDiscover = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "SearchBarDiscover" */ './SearchBarDiscover'),
});
const PaginationBarDiscover = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "PaginationBarDiscover" */ './DiscoverBody/PaginationBarDiscover'),
});
const Details = Loadable({
  loading: Empty,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "Details" */ './Details'),
});
const ManageProfile = Loadable({
  loading: Empty,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "ManageProfile" */ './ManageProfile'),
});

const NotFound = Loadable({
  loading: Empty,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "NotFound" */ './NotFound'),
});
const SearchBar = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "SearchBar" */ './SearchBar'),
});

// const ManageProfile = React.lazy(() => import('./ManageProfile'));
const rootEl = document.getElementById('root'); // from index.html <div id="root"></div>
interface AppRoutes {
  shouldRender: string;
  isLoggedIn: boolean;
}

const AppRoutes = React.memo(
  ({ shouldRender, isLoggedIn }: AppRoutes) => {
    const location = useLocation();
    return (
      <>
        <NavBar />
        <KeepMountedLayout
          mountedCondition={location.pathname === '/'}
          render={() => (
            <>
              <StateStargazersProvider>
                <SearchBar />
              </StateStargazersProvider>
              {shouldRender === ShouldRender.Home && (
                <StateStargazersProvider>
                  <StateDiscoverProvider>
                    <Home />
                  </StateDiscoverProvider>
                </StateStargazersProvider>
              )}
            </>
          )}
        />
        <KeepMountedLayout
          mountedCondition={location.pathname === '/discover' && shouldRender === ShouldRender.Discover && isLoggedIn}
          render={() => (
            <StateStargazersProvider>
              <SearchBarDiscover />
              <StateDiscoverProvider>
                <Discover />
              </StateDiscoverProvider>
              <PaginationBarDiscover />
            </StateStargazersProvider>
          )}
        />
        <KeepMountedLayout
          mountedCondition={location.pathname === '/profile' && shouldRender === ShouldRender.Profile && isLoggedIn}
          render={() => <ManageProfile />}
        />
        <Switch>
          <Route path="/login" exact component={Login} />
          <Route path="/detail/:id" exact component={Details} />
        </Switch>
        {!['/', '/profile', '/discover', '/login'].includes(location.pathname) && <NotFound />}
      </>
    );
  },
  (prevProps, nextProps) => {
    return shallowEqual(prevProps, nextProps);
  }
);
const MiddleAppRoute = () => {
  const abortController = new AbortController();
  const { db, clear } = DbCtx.useContainer();
  const [stateShared, dispatchShared] = useTrackedStateShared();
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
  const client = useApolloClient();

  const { lastJsonMessage, getWebSocket, sendJsonMessage } = useWebSocket(
    readEnvironmentVariable('GRAPHQL_WS_ADDRESS_NODEJS')!,
    {
      shouldReconnect: (closeEvent) => true,
    }
  );

  const readQuery = (key: any) => {
    return new Promise((resolve, reject) => {
      (async () => {
        const oldData: GraphQLUserData | null = (await client.cache.readQuery({ query: key })) || null;
        resolve(oldData);
      })();
    });
  };
  useEffect(() => {
    if (lastJsonMessage?.impactedQuery?.length > 0) {
      lastJsonMessage.impactedQuery.forEach((obj: any) => {
        const key: string = Object.keys(obj)[0];
        readQuery(associate[key]).then((oldData: any) => {
          const newData: any = Object.values(obj)[0];
          if (newData && oldData) {
            console.log('NEW DATA');
            client.cache.writeQuery({
              query: associate[key],
              data: {
                [key]: {
                  ...oldData[key],
                  ...newData,
                },
              },
            });
          }
        });
      });
    } else if (lastJsonMessage?.newUser) {
      //TODO: show dialog bar Tutorial https://github.com/shipshapecode/shepherd
      console.log('Welcome');
    }
  }, [lastJsonMessage || {}]);

  useEffect(() => {
    let isFinished = false;
    if ('serviceWorker' in navigator && stateShared.isLoggedIn && !isFinished) {
      navigator.serviceWorker
        .register('sw.js')
        .then(() => navigator.serviceWorker.ready)
        .then(async (reg) => {
          const permission = await window.Notification.requestPermission();
          if (permission === 'granted' || permission === 'default') {
            const subscription = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(readEnvironmentVariable('VAPID_PUB_KEY')),
            });
            subscribeToApollo({ signal: abortController.signal, subscription }).then(noop);
            channel.addEventListener('message', (event) => {
              console.log('Received', event.data);
              reg.showNotification(
                event.data.title, // title of the notification
                {
                  body: 'Push notification from section.io', //the body of the push notification
                  image: 'https://pixabay.com/vectors/bell-notification-communication-1096280/',
                  icon: 'https://pixabay.com/vectors/bell-notification-communication-1096280/', // icon
                }
              );
            });
          }
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
        });
    } else if ('serviceWorker' in navigator && !stateShared.isLoggedIn && !isFinished) {
      navigator?.serviceWorker?.controller?.postMessage({
        type: 'logout',
      });
    }
    return () => {
      isFinished = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateShared.isLoggedIn]);

  useEffect(() => {
    let isFinished = false;
    if (!isFinished && stateShared.isLoggedIn && stateShared.username.length > 0) {
      sendJsonMessage({ open: { user: stateShared.username, topic: readEnvironmentVariable('KAFKA_TOPIC_APOLLO') } });
      getFile('languages.json', abortController.signal).then((githubLanguages) => {
        if (abortController.signal.aborted) return;
        if (githubLanguages) {
          dispatchShared({
            type: 'SET_GITHUB_LANGUAGES',
            payload: {
              githubLanguages,
            },
          });
        }
      });
      getTokenGQL(abortController.signal).then((res) => {
        if (abortController.signal.aborted) return;
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
    session(false, abortController.signal).then((data) => {
      if (data) {
        if (abortController.signal.aborted) return;
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
      }
    });
    return () => {
      isFinished = true;
    };
  }, [stateShared.isLoggedIn, stateShared.username]);

  window.onbeforeunload = () => {
    if (stateShared.isLoggedIn) {
      sendJsonMessage({
        close: { user: stateShared.username, topic: readEnvironmentVariable('KAFKA_TOPIC_APOLLO') },
      });
      Promise.all([
        db?.transaction(
          'rw',
          [db.getUserData, db.getUserInfoData, db.getUserInfoStarred, db.getSeen, db.getSearches],
          async () => {
            const cache: any = client.cache.extract();
            Object.entries(cache.ROOT_QUERY).forEach(([key, val]) => {
              if (!(key === '__typename')) {
                switch (key) {
                  case 'getUserInfoData':
                    db?.getUserInfoData?.update(1, { data: JSON.stringify({ getUserInfoData: val }) });
                    break;
                  case 'getUserInfoStarred':
                    db?.getUserInfoStarred?.update(1, { data: JSON.stringify({ getUserInfoStarred: val }) });
                    break;
                  case 'getSeen':
                    db?.getSeen?.update(1, { data: JSON.stringify({ getSeen: val }) });
                    break;
                  case 'getSearches':
                    db?.getSearches?.update(1, { data: JSON.stringify({ getSearches: val }) });
                    break;
                  case 'getUserData':
                    db?.getUserData?.update(1, { data: JSON.stringify({ getUserData: val }) });
                    break;
                }
              }
            });
          }
        ),
        endOfSession(stateShared.username, client.cache.extract()),
        // session(true),
      ]).then(noop);
    }
    return window.close();
  };
  useEffect(() => {
    return () => {
      getWebSocket()?.close();
      abortController.abort();
    };
  }, []);

  return <AppRoutes isLoggedIn={stateShared.isLoggedIn} shouldRender={stateShared.shouldRender} />;
};
const CustomApolloProvider = ({ children }: any) => {
  const history = useHistory();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const unAuthorizedAction = () => {
    logoutAction(history, dispatchShared);
    window.alert('Your token has expired. We will log you out.');
  };

  const clientWrapped = useStableCallback(() => {
    const githubGateway = new HttpLink({
      uri: 'https://api.github.com/graphql',
      headers: {
        Authorization: `Bearer ${stateShared.tokenGQL}`,
      },
    }) as unknown as ApolloLink;
    // Create Second Link for appending data to MongoDB using GQL
    const mongoGateway = new HttpLink({
      uri: `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable('GOLANG_PORT')}/graphql/`,
      headers: { origin: `${readEnvironmentVariable('CLIENT_HOST')}:${readEnvironmentVariable('CLIENT_PORT')}` },
      credentials: 'include',
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
                validGQLProperties?.data.includes(property) &&
                stateShared.isLoggedIn
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
      credentials: 'include',
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
      </StateProvider>
    </Router>
  );
};
window.addEventListener('unhandledrejection', function (promiseRejectionEvent) {
  console.log(promiseRejectionEvent);
});
window.onunhandledrejection = function (event: PromiseRejectionEvent) {
  console.log(event.reason);
};
ReactDOM.render(<Main />, rootEl);
