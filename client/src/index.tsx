import React, { createContext, useCallback, useMemo, useReducer } from 'react';
import './index.scss';
import ReactDOM from 'react-dom';
import './hamburgers.css';
import { IContext, IContextStargazers } from './typing/interface';
import { initialState, initialStateStargazers, reducer, reducerStargazers } from './store/reducer';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import NavBar from './NavBar';
import RateLimit from './RateLimit';
import { ApolloClient, ApolloLink, getApolloContext, HttpLink, InMemoryCache } from '@apollo/client';
import Global from './Global';
import AuthedHandler from './AuthedHandler';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import CryptoJS from 'crypto-js';
import { readEnvironmentVariable } from './util';
import { logoutAction } from './util/util';
const CustomApolloProvider = ({ client, children, tokenGQL, session }: any) => {
  const ApolloContext = getApolloContext();
  const value = useMemo(
    () => ({ client }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokenGQL, session]
  );
  return <ApolloContext.Provider value={value}>{children}</ApolloContext.Provider>;
};
const rootEl = document.getElementById('root'); // from index.html <div id="root"></div>
export const Context = createContext({} as IContext);
export const ContextStargazers = createContext({} as IContextStargazers);
export const Main = () => {
  const history = useHistory();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [stateStargazers, dispatchStargazers] = useReducer(reducerStargazers, initialStateStargazers);
  // Create First Link for querying data to external Github GQL API
  const githubGateway = new HttpLink({
    uri: 'https://api.github.com/graphql',
    headers: {
      Authorization: `Bearer ${state.tokenGQL}`,
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
  let link = ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) => {
          console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
          if (message === 'Unauthorized') {
            logoutAction(history, dispatch, dispatchStargazers);
          }
        });
      }
      if (networkError) {
        console.log('Network Error: ', networkError);
        // localStorage.removeItem('sess');
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
  const client = new ApolloClient({
    link: link,
    cache: cache,
  });
  const session = useCallback(() => {
    return localStorage.getItem('sess');
  }, [localStorage.getItem('sess')]);

  const tokenGQLMemo = useCallback(() => {
    return state.tokenGQL;
  }, [state.tokenGQL]);

  return (
    <CustomApolloProvider client={client} tokenGQL={tokenGQLMemo()} session={session()}>
      <Router>
        <AuthedHandler
          component={RateLimit}
          path="/profile"
          authenticator={state.width > 830}
          componentProps={{ state, dispatch }}
        />
        <AuthedHandler
          component={NavBar}
          authenticator={true}
          componentProps={{ state, dispatch, dispatchStargazers }}
        />
        <Switch>
          <AuthedHandler
            exact
            path="/"
            component={Global}
            authenticator={true}
            componentProps={{ state, stateStargazers, dispatch, dispatchStargazers }}
          />
          <AuthedHandler
            exact
            path="/login"
            component={Global}
            authenticator={state.isLoggedIn === false}
            componentProps={{ state, stateStargazers, dispatch, dispatchStargazers }}
          />
          <AuthedHandler
            exact
            path="/discover"
            component={Global}
            authenticator={state.isLoggedIn === true}
            componentProps={{ state, stateStargazers, dispatch, dispatchStargazers }}
          />
          <AuthedHandler
            exact
            path="/trending"
            component={Global}
            authenticator={state.isLoggedIn === true}
            componentProps={{ state, stateStargazers, dispatch, dispatchStargazers }}
          />
          <AuthedHandler
            exact
            path="/profile"
            component={Global}
            authenticator={state.isLoggedIn === true}
            componentProps={{ state, stateStargazers, dispatch, dispatchStargazers }}
          />
          <AuthedHandler
            exact
            path="/detail/:id"
            redirect="/login"
            component={Global}
            authenticator={state.isLoggedIn === true}
            componentProps={{ state, stateStargazers, dispatch, dispatchStargazers }}
          />
          <Route render={() => <h1>404</h1>} />
        </Switch>
      </Router>
    </CustomApolloProvider>
  );
};
ReactDOM.render(<Main />, rootEl);
