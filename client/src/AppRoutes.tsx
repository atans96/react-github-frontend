import {
  StateDiscoverProvider,
  StateStargazersProvider,
  useTrackedStateShared,
} from './selectors/stateContextSelector';
import sysend from 'sysend';
import { useApolloClient } from '@apollo/client';
import useWebSocket from './util/websocket';
import { readEnvironmentVariable, urlBase64ToUint8Array } from './util';
import React, { useEffect, useState } from 'react';
import { associate } from './graphql/queries';
import { endOfSession, getFile, getTokenGQL, session, startOfSessionDexie, subscribeToApollo } from './services';
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
import DbCtx from './db/db.ctx';

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
  const { db, clear } = DbCtx.useContainer();
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

  useEffect(() => {
    if (lastJsonMessage?.updateDescription && Object.keys(lastJsonMessage?.updateDescription).length > 0) {
      const updatedFields = lastJsonMessage?.updateDescription.updatedFields;
      for (let [key, value] of Object.entries<any>(updatedFields)) {
        for (let [x, y] of Object.entries(associate)) {
          if (x.includes(key) && y === y + '') {
            switch (y) {
              case 'getSuggested': //TODO: only subscribe to suggested topic
                if (Array.isArray(value) && value?.length > 0) {
                  console.log('suggested updated');
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
  const [doneFetch, setDoneFetch] = useState(false);
  useEffect(() => {
    let isFinished = false;
    if (!isFinished) {
      session(false, stateShared.username, abortController.signal).then((data) => {
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
        setDoneFetch(true);
      });
      if (stateShared.isLoggedIn && stateShared.username.length > 0) {
        sendJsonMessage({
          open: {
            user: stateShared.username,
            topic: readEnvironmentVariable('KAFKA_TOPIC_APOLLO'),
          },
        });
        getTokenGQL(stateShared.username, abortController.signal).then((res) => {
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
        // endOfSession(stateShared.username, client.cache.extract()).then(noop);
      }
    }
    return () => {
      isFinished = true;
    };
  }, [stateShared.isLoggedIn, stateShared.username, db]);

  useEffect(() => {
    if (db && doneFetch && stateShared.isLoggedIn) {
      Promise.allSettled([
        new Promise((resolve, reject) => {
          db?.getSeen.get(1).then((oldData: any) => {
            if (oldData && oldData?.data) {
              resolve({ [Object.keys(JSON.parse(oldData.data))[0]]: JSON.parse(oldData.data) });
            } else {
              reject('');
            }
          });
        }),
        new Promise((resolve, reject) => {
          db?.getClicked.get(1).then((oldData: any) => {
            if (oldData && oldData?.data) {
              resolve({ [Object.keys(JSON.parse(oldData.data))[0]]: JSON.parse(oldData.data) });
            } else {
              reject('');
            }
          });
        }),
        new Promise((resolve, reject) => {
          db?.getSearches.get(1).then((oldData: any) => {
            if (oldData && oldData?.data) {
              resolve({ [Object.keys(JSON.parse(oldData.data))[0]]: JSON.parse(oldData.data) });
            } else {
              reject('');
            }
          });
        }),
        new Promise((resolve, reject) => {
          db?.getUserInfoStarred.get(1).then((oldData: any) => {
            if (oldData && oldData?.data) {
              resolve({ [Object.keys(JSON.parse(oldData.data))[0]]: JSON.parse(oldData.data) });
            } else {
              reject('');
            }
          });
        }),
        new Promise((resolve, reject) => {
          db?.getUserInfoStarred.get(1).then((oldData: any) => {
            if (oldData && oldData?.data) {
              resolve({ [Object.keys(JSON.parse(oldData.data))[0]]: JSON.parse(oldData.data) });
            } else {
              reject('');
            }
          });
        }),
        new Promise((resolve, reject) => {
          db?.getUserData.get(1).then((oldData: any) => {
            if (oldData && oldData?.data) {
              resolve({
                [Object.keys(JSON.parse(oldData.data))[0]]: {
                  languagePreference: JSON.parse(oldData.data).getUserData.languagePreference,
                  avatar: JSON.parse(oldData.data).getUserData.avatar,
                },
              });
            } else {
              reject('');
            }
          });
        }),
      ]).then((res) => {
        const result = res
          .map((obj) => {
            if (obj.status === 'fulfilled') {
              return obj.value;
            }
          })
          .filter((e) => !!e);
        if (result.length > 0) startOfSessionDexie(stateShared.username, result).then(noop);
      });
    } else if (doneFetch && !stateShared.isLoggedIn) {
      clear();
      localStorage.clear();
      navigator?.serviceWorker?.controller?.postMessage({
        type: 'logout',
      });
    }
  }, [db, doneFetch]);

  window.onbeforeunload = () => {
    if (stateShared.isLoggedIn) {
      sendJsonMessage({
        close: { user: stateShared.username, topic: readEnvironmentVariable('KAFKA_TOPIC_APOLLO') },
      });
      if ((client.cache.extract() as any).ROOT_QUERY.getRSSFeed) {
        Promise.all([endOfSession(stateShared.username, client.cache.extract())]).then(noop);
      }
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
