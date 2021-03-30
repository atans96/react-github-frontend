import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import './index.scss';
import ReactDOM from 'react-dom';
import './hamburgers.css';
import { initialState, reducer } from './store/Home/reducer';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NavBar from './NavBar';
import { ApolloClient, ApolloLink, getApolloContext, HttpLink, InMemoryCache } from '@apollo/client';
import Global from './Global';
import AuthedHandler from './AuthedHandler';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import CryptoJS from 'crypto-js';
import { readEnvironmentVariable } from './util';
import { logoutAction } from './util/util';
import { useHistory } from 'react-router';
import { getValidGQLProperties } from './services';
import { StarRankingContainer, SuggestedRepoContainer, SuggestedRepoImagesContainer } from './selectors/stateSelector';
import { initialStateDiscover, reducerDiscover } from './store/Discover/reducer';
import { initialStateManageProfile, reducerManageProfile } from './store/ManageProfile/reducer';
import { initialStateShared, reducerShared } from './store/Shared/reducer';
import { initialStateStargazers, reducerStargazers } from './store/Staargazers/reducer';
import { IContext } from './typing/interface';
import Details from './Details';

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
const CountContext = React.createContext<IContext | undefined>(undefined);
export const Main = () => {
  const [stateShared, dispatchShared] = useReducer(reducerShared, initialStateShared);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [stateStargazers, dispatchStargazers] = useReducer(reducerStargazers, initialStateStargazers);
  const [stateDiscover, dispatchDiscover] = useReducer(reducerDiscover, initialStateDiscover);
  const [stateManageProfile, dispatchManageProfile] = useReducer(reducerManageProfile, initialStateManageProfile);

  const history = useHistory();
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
  const isLoggedInRef = useRef(stateShared.isLoggedIn);
  useEffect(() => {
    isLoggedInRef.current = stateShared.isLoggedIn;
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
          if (property && property.length > 0 && validGQLProperties.data.includes(property) && isLoggedInRef.current) {
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
  const client = new ApolloClient({
    link: link,
    cache: cache,
  });
  const session = useCallback(() => {
    return localStorage.getItem('sess');
  }, [localStorage.getItem('sess')]);

  const tokenGQLMemo = useCallback(() => {
    return stateShared.tokenGQL;
  }, [stateShared.tokenGQL]);
  return (
    <CustomApolloProvider client={client} tokenGQL={tokenGQLMemo()} session={session()}>
      <SuggestedRepoImagesContainer.Provider>
        <SuggestedRepoContainer.Provider>
          <StarRankingContainer.Provider>
            <Router>
              <AuthedHandler
                component={NavBar}
                path="/"
                authenticator={true}
                componentProps={{
                  state,
                  stateShared,
                  stateManageProfile,
                  stateDiscover,
                  stateStargazers,
                  dispatch,
                  dispatchStargazers,
                  dispatchDiscover,
                  dispatchManageProfile,
                  dispatchShared,
                }}
              />
              <Switch>
                <AuthedHandler
                  exact
                  path="/"
                  component={Global}
                  authenticator={true}
                  componentProps={{
                    state,
                    stateShared,
                    stateManageProfile,
                    stateDiscover,
                    stateStargazers,
                    dispatch,
                    dispatchStargazers,
                    dispatchDiscover,
                    dispatchManageProfile,
                    dispatchShared,
                  }}
                />
                <AuthedHandler
                  exact
                  path="/login"
                  component={Global}
                  authenticator={stateShared.isLoggedIn === false}
                  componentProps={{
                    state,
                    stateShared,
                    stateManageProfile,
                    stateDiscover,
                    stateStargazers,
                    dispatch,
                    dispatchStargazers,
                    dispatchDiscover,
                    dispatchManageProfile,
                    dispatchShared,
                  }}
                />
                <AuthedHandler
                  exact
                  path="/discover"
                  redirect="/login"
                  component={Global}
                  authenticator={stateShared.isLoggedIn === true}
                  componentProps={{
                    state,
                    stateShared,
                    stateManageProfile,
                    stateDiscover,
                    stateStargazers,
                    dispatch,
                    dispatchStargazers,
                    dispatchDiscover,
                    dispatchManageProfile,
                    dispatchShared,
                  }}
                />
                <AuthedHandler
                  exact
                  path="/profile"
                  redirect="/login"
                  component={Global}
                  authenticator={stateShared.isLoggedIn === true}
                  componentProps={{
                    state,
                    stateShared,
                    stateManageProfile,
                    stateDiscover,
                    stateStargazers,
                    dispatch,
                    dispatchStargazers,
                    dispatchDiscover,
                    dispatchManageProfile,
                    dispatchShared,
                  }}
                />
                <AuthedHandler
                  exact
                  path="/detail/:id"
                  redirect="/login"
                  component={Details}
                  authenticator={stateShared.isLoggedIn === true}
                  componentProps={{
                    state,
                    stateShared,
                    stateManageProfile,
                    stateDiscover,
                    stateStargazers,
                    dispatch,
                    dispatchStargazers,
                    dispatchDiscover,
                    dispatchManageProfile,
                    dispatchShared,
                  }}
                />
                <Route render={() => <h1>404</h1>} />
              </Switch>
            </Router>
          </StarRankingContainer.Provider>
        </SuggestedRepoContainer.Provider>
      </SuggestedRepoImagesContainer.Provider>
    </CustomApolloProvider>
  );
};
ReactDOM.render(<Main />, rootEl);
