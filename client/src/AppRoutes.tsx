import {
  StateDiscoverProvider,
  StateStargazersProvider,
  useTrackedStateShared,
} from './selectors/stateContextSelector';
import sysend from 'sysend';
import { useApolloClient } from '@apollo/client';
import useWebSocket from './util/websocket';
import { readEnvironmentVariable, urlBase64ToUint8Array } from './util';
import React, { useEffect, useRef } from 'react';
import { associate } from './graphql/queries';
import { endOfSession, getFile, startOfSessionDexie, subscribeToApollo } from './services';
import { logoutAction, noop } from './util/util';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import KeepMountedLayout from './components/Layout/KeepMountedLayout';
import { ShouldRender } from './typing/enum';
import {
  DetailsLoadable,
  DiscoverLoadable,
  HomeLoadable,
  LoginLoadable,
  ManageProfileLoadable,
  NotFoundLoadable,
  SearchBarLoadable,
} from './AppRoutesLoadable';
import DbCtx, { useDexieDB } from './db/db.ctx';
import useResizeObserver from './hooks/useResizeObserver';
import { useFetchDB } from './hooks/useFetchDB';

interface AppRoutesProps {
  shouldRender: string;
  isLoggedIn: boolean;
}

const channel = new BroadcastChannel('sw-messages');
const Child = React.memo(
  ({ shouldRender, isLoggedIn }: AppRoutesProps) => {
    const location = useLocation();
    const windowScreenRef = useRef<HTMLDivElement>(null);
    const [stateShared, dispatchShared] = useTrackedStateShared();
    useResizeObserver(windowScreenRef, (entry: any) => {
      if (stateShared.width !== entry.contentRect.width && stateShared.shouldRender === '') {
        dispatchShared({
          type: 'SET_WIDTH',
          payload: {
            width: entry.contentRect.width,
          },
        });
      }
    });
    return (
      <div ref={windowScreenRef}>
        <NavBar />
        <KeepMountedLayout
          mountedCondition={location.pathname === '/'}
          render={() => (
            <StateStargazersProvider>
              <SearchBarLoadable />
              {(shouldRender === ShouldRender.Home || shouldRender === ShouldRender.LoginGQL) && (
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
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.shouldRender === nextProps.shouldRender && prevProps.isLoggedIn === nextProps.isLoggedIn;
  }
);
const AppRoutes = () => {
  const isFinished = useRef(false);
  const history = useHistory();
  const { clear } = DbCtx.useContainer();
  const [db] = useDexieDB();
  const abortController = new AbortController();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const setFetchDB = useFetchDB(db);
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
    return () => {
      isFinished.current = true;
      getWebSocket()?.close();
      abortController.abort();
    };
  }, []);

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
      console.log('Welcome!');
    }
  }, [lastJsonMessage || {}]);

  useEffect(() => {
    if ('serviceWorker' in navigator && stateShared.isLoggedIn && !isFinished.current) {
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
    } else if ('serviceWorker' in navigator && !stateShared.isLoggedIn && !isFinished.current) {
      navigator?.serviceWorker?.controller?.postMessage({
        type: 'logout',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateShared.isLoggedIn]);
  useEffect(() => {
    if (stateShared.isLoggedIn) {
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
    }
  }, [stateShared.shouldRender, stateShared.isLoggedIn]);
  const doneFetchRef = useRef(false);
  useEffect(() => {
    if (!isFinished.current && stateShared.isLoggedIn) {
      sendJsonMessage({
        open: {
          user: stateShared.username,
          topic: readEnvironmentVariable('KAFKA_TOPIC_APOLLO'),
        },
      });
      // endOfSession(stateShared.username, client.cache.extract()).then(noop);
    }
  }, [stateShared.isLoggedIn, stateShared.username.length]);

  useEffect(() => {
    if (db && !doneFetchRef.current && stateShared.isLoggedIn) {
      setFetchDB();
      doneFetchRef.current = true;
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
        if (result.length > 0)
          startOfSessionDexie(stateShared.username, result).then((res) => {
            if (!res) {
              logoutAction(history, dispatchShared, stateShared.username);
            }
          });
      });
    } else if (!stateShared.isLoggedIn) {
      clear();
      localStorage.clear();
      navigator?.serviceWorker?.controller?.postMessage({
        type: 'logout',
      });
    }
  }, [db, doneFetchRef.current]);

  window.onbeforeunload = () => {
    if (stateShared.isLoggedIn) {
      sendJsonMessage({
        close: { user: stateShared.username, topic: readEnvironmentVariable('KAFKA_TOPIC_APOLLO') },
      });
      if ((client.cache.extract() as any).ROOT_QUERY.getRSSFeed) {
        Promise.all([endOfSession(stateShared.username, client.cache.extract())]).then(noop);
      }
      abortController.abort();
    }
    return window.close();
  };

  return <Child isLoggedIn={stateShared.isLoggedIn} shouldRender={stateShared.shouldRender} />;
};
AppRoutes.displayName = 'AppRoutes';
export default AppRoutes;
