import { useHistory } from 'react-router-dom';
import { logoutAction } from './util/util';
import { readEnvironmentVariable, useStableCallback } from './util';
import { HttpLink } from './link/http/HttpLink';
import { ApolloClient, ApolloLink, getApolloContext, InMemoryCache } from '@apollo/client';
import { HttpLink as HttpLink1 } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import React from 'react';
import { useTrackedStateShared } from './selectors/stateContextSelector';

const CustomApolloProvider = ({ children }: any) => {
  const history = useHistory();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const unAuthorizedAction = () => {
    logoutAction(history, dispatchShared, stateShared.username);
    window.alert('Your token has expired. We will log you out.');
  };

  const clientWrapped = useStableCallback(() => {
    const githubGateway = new HttpLink1({
      uri: 'https://api.github.com/graphql',
      headers: {
        Authorization: `Bearer ${stateShared.tokenGQL}`,
        'Content-Type': 'application/json',
      },
    });

    // Create Second Link for appending data to MongoDB using GQL
    const mongoGateway = new HttpLink({
      uri: `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable('GOLANG_PORT')}/graphql/`,
      headers: {
        Authorization: `${stateShared.username}`,
        origin: `${readEnvironmentVariable('CLIENT_HOST')}:${readEnvironmentVariable('CLIENT_PORT')}`,
      },
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
export default CustomApolloProvider;
