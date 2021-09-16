import {
  StateDiscoverProvider,
  StateStargazersProvider,
  useTrackedStateShared,
} from './selectors/stateContextSelector';
import sysend from 'sysend';
import { useApolloClient } from '@apollo/client';
import useWebSocket from './util/websocket';
import { readEnvironmentVariable, urlBase64ToUint8Array } from './util';
import React, { useEffect } from 'react';
import { associate } from './graphql/queries';
import { endOfSession, getFile, getTokenGQL, session, subscribeToApollo } from './services';
import { noop } from './util/util';
import { Route, Switch, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import KeepMountedLayout from './components/Layout/KeepMountedLayout';
import { ShouldRender } from './typing/enum';
import { shallowEqual } from 'fast-equals';
import {
  DetailsLoadable,
  DiscoverLoadable,
  HomeLoadable,
  LoginLoadable,
  ManageProfileLoadable,
  NotFoundLoadable,
  SearchBarLoadable,
} from './AppRoutesLoadable';
import { useGetUserInfoStarredMutation } from './apolloFactory/useGetUserInfoStarredMutation';
import { useGetClickedMutation } from './apolloFactory/useGetClickedMutation';
import { useGetSeenMutation } from './apolloFactory/useGetSeenMutation';
import { useRSSFeedMutation } from './apolloFactory/useRSSFeedMutation';

interface AppRoutes {
  shouldRender: string;
  isLoggedIn: boolean;
}

const channel = new BroadcastChannel('sw-messages');
const Child = React.memo(
  ({ shouldRender, isLoggedIn }: AppRoutes) => {
    const location = useLocation();
    return (
      <>
        <NavBar />
        <KeepMountedLayout
          mountedCondition={location.pathname === '/'}
          render={() => (
            <StateStargazersProvider>
              <SearchBarLoadable />
              {shouldRender === ShouldRender.Home && (
                <StateDiscoverProvider>
                  <HomeLoadable />
                </StateDiscoverProvider>
              )}
            </StateStargazersProvider>
          )}
        />
        <KeepMountedLayout
          mountedCondition={location.pathname === '/discover' && shouldRender === ShouldRender.Discover && isLoggedIn}
          render={() => <DiscoverLoadable />}
        />
        <KeepMountedLayout
          mountedCondition={location.pathname === '/profile' && shouldRender === ShouldRender.Profile && isLoggedIn}
          render={() => <ManageProfileLoadable />}
        />
        <Switch>
          <Route path="/login" exact component={LoginLoadable} />
          <Route path="/detail/:id" exact component={DetailsLoadable} />
        </Switch>
        {!/\/|\/profile|\/discover|\/login|\/detail\/^\d+$/.test(location.pathname) && <NotFoundLoadable />}
      </>
    );
  },
  (prevProps, nextProps) => {
    return shallowEqual(prevProps, nextProps);
  }
);
const AppRoutes = () => {
  const abortController = new AbortController();
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

  const { addedStarredMe } = useGetUserInfoStarredMutation();
  const clickedAdded = useGetClickedMutation();
  const seenAdded = useGetSeenMutation();
  const rssFeedAdded = useRSSFeedMutation();

  useEffect(() => {
    if (lastJsonMessage?.updateDescription && Object.keys(lastJsonMessage?.updateDescription).length > 0) {
      const updatedFields = lastJsonMessage?.updateDescription.updatedFields;
      for (let [key, value] of Object.entries<any>(updatedFields)) {
        for (let [x, y] of Object.entries(associate)) {
          if (x.includes(key) && y === y + '') {
            switch (y) {
              case 'getRSSFeed':
                rssFeedAdded(value).then(noop);
                break;
              case 'getSeen':
                if (Array.isArray(value) && value?.length > 0) {
                  seenAdded(value);
                }
                break;
              case 'getClicked':
                if (Array.isArray(value) && value?.length > 0) {
                  clickedAdded(value).then(noop);
                }
                break;
              case 'getUserInfoStarred':
                if (Array.isArray(value) && value?.length > 0) {
                  addedStarredMe(value).then(noop);
                }
                break;
            }
          }
        }
      }
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
  }, [stateShared.shouldRender]);

  useEffect(() => {
    let isFinished = false;
    if (!isFinished) {
      session(false, abortController.signal).then((data) => {
        if (abortController.signal.aborted) return;
        if (data) {
          if (Boolean(data.data) && data.username.length > 0) {
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
        }
      });
      if (stateShared.isLoggedIn && stateShared.username.length > 0) {
        sendJsonMessage({
          open: {
            user: stateShared.username,
            topic: readEnvironmentVariable('KAFKA_TOPIC_APOLLO'),
          },
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
    }
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

  return <Child isLoggedIn={stateShared.isLoggedIn} shouldRender={stateShared.shouldRender} />;
};
AppRoutes.displayName = 'AppRoutes';
export default AppRoutes;
