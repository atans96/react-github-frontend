import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import useHover from './hooks/useHover';
import Profile from './NavBarBody/Profile';
import Logout from './NavBarBody/Logout';
import Login from './NavBarBody/Login';
import Home from './NavBarBody/Home';
import Discover from './NavBarBody/SearchSuggested';
import { logoutAction } from './util/util';
import { If } from './util/react-if/If';
import { Then } from './util/react-if/Then';
import { useTrackedStateShared } from './selectors/stateContextSelector';
import { ProgressNavBarLayout } from './Layout/ProgressNavBarLayout';
import { getAllGraphQLNavBar } from './services';
import { useStableCallback } from './util';

//why default is explored to true? because some component doesn't use useApolloFactory to fetch at first mounted
const directionLogin = new Map(
  [
    { path: 'home', index: 1, explored: true },
    { path: 'discover', index: 2, explored: true },
    { path: 'profile', index: 3, explored: false },
    { path: 'logout', index: 4, explored: true },
  ].map((i) => [i.path, { index: i.index, explored: i.explored }])
);
const directionNotLogin = new Map(
  [
    { path: 'home', index: 1, explored: true },
    { path: 'login', index: 2, explored: true },
  ].map((i) => [i.path, { index: i.index, explored: i.explored }])
);

const NavBar = () => {
  const abortController = new AbortController();
  const [state, dispatch] = useTrackedStateShared();
  const [active, setActiveBar] = useState<any>('');
  const navBarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const [isHoveredLogin, bindLogin] = useHover();
  const [isHoveredLogout, bindLogout] = useHover();
  const [isHoveredProfile, bindProfile] = useHover();
  const [isHoveredDiscover, bindDiscover] = useHover();
  const [isHoveredHome, bindHome] = useHover();
  const Active = location.pathname.split('/');

  const te = Active[1] !== '' ? Active[1] : 'home';
  const number = state.isLoggedIn ? directionLogin?.get(te)?.index : directionNotLogin?.get(te)?.index;
  const [nextClickedId, setNextClickedId] = useState<number>(number || 0);
  const previousClickedId = useRef<number>(number || 0);
  const previousActive = useRef<string>('');
  const [isFinished, setIsFinished] = useState<boolean>(true);
  const [stateShared] = useTrackedStateShared();
  const history = useHistory();
  useEffect(() => {
    let isFinished = false;
    if ((state.isLoggedIn ? directionLogin : directionNotLogin).get(Active[1] !== '' ? Active[1] : 'home')) {
      setActiveBar(Active[1] !== '' ? Active[1] : 'home'); //handle the case where you enter /profile directly instead of clicking
    }
    return () => {
      isFinished = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      abortController.abort();
    };
  }, []);
  const handleClick = useStableCallback((event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault(); // avoid the href "#/""e to be appended in the URL bar when click
    const res = event.currentTarget.id;
    if (res !== 'home') {
      //this is because we don't want to render Home until the user submit form via SearchBar
      dispatch({
        type: 'SET_SHOULD_RENDER',
        payload: {
          shouldRender: res,
        },
      });
    }
    setActiveBar((prevState: string) => {
      previousActive.current = prevState;
      return res;
    });
    if (!state.isLoggedIn) {
      const res = directionNotLogin?.get(event.currentTarget.id)?.index || -1;
      setNextClickedId((prevState) => {
        previousClickedId.current = prevState;
        return res;
      });
      if (event.currentTarget.id === 'home') {
        history.push('/');
      } else if (event.currentTarget.id === 'logout') {
        logoutAction(history, dispatch);
      } else {
        history.push(`/${event.currentTarget.id.toLowerCase()}`);
      }
    } else {
      setIsFinished(false);
      const res = directionLogin?.get(event.currentTarget.id)?.index || -1;
      setNextClickedId((prevState) => {
        previousClickedId.current = prevState;
        return res;
      });
    }
  });

  useEffect(() => {
    let isFinished = false;
    if (!isFinished && state.isLoggedIn && active && !directionLogin?.get(active.toLowerCase())?.explored) {
      getAllGraphQLNavBar(stateShared.username, abortController.signal).then((data) => {
        if (abortController.signal.aborted) {
          return;
        }
        setIsFinished(true);
        directionLogin.set(
          active.toLowerCase(),
          Object.assign({}, directionLogin.get(active.toLowerCase()), {
            explored: true,
          })
        );
        if (active === 'home') {
          history.push('/');
        } else if (active === 'logout') {
          logoutAction(history, dispatch);
        } else {
          //TODO: don't push state to history for RowTwo and RowOne.
          history.push({
            pathname: `/${active.toLowerCase()}`,
            state: { data, previousPath: location.pathname },
          });
        }
      });
    } else if (!isFinished && directionLogin?.get(active.toLowerCase())?.explored) {
      setIsFinished(true);
      if (active === 'home') {
        history.push('/');
      } else if (active === 'logout') {
        logoutAction(history, dispatch);
      } else {
        history.push({ pathname: `/${active.toLowerCase()}` });
      }
    }
    return () => {
      isFinished = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="navbar" ref={navBarRef}>
      <ul>
        <div
          style={{
            width: '100px',
            borderBottom: `${(previousActive.current === '' || isFinished) && active === 'home' ? '4px solid' : '0px'}`,
          }}
        >
          <NavLink
            to={{
              pathname: `/`,
            }}
            className="btn-clear nav-link"
          >
            <Home
              componentProps={{
                id: 'home',
                className: active === 'home' && isFinished ? 'active' : '',
                onClick: handleClick,
                active: active,
                binder: bindHome,
                style:
                  isHoveredHome && active !== 'home'
                    ? {
                        backgroundColor: '#f03e76',
                        cursor: 'pointer',
                      }
                    : {},
              }}
            />
          </NavLink>
          {!isFinished && previousActive.current === 'home' && nextClickedId > 0 && (
            <ProgressNavBarLayout
              nextClickedId={nextClickedId}
              previousClickedId={previousClickedId.current}
              isLeft={1}
            />
          )}
        </div>

        <If condition={state.isLoggedIn}>
          <Then>
            <div
              style={{
                width: '100px',
                borderBottom: `${
                  (previousActive.current === '' || isFinished) && active === 'discover' ? '4px solid' : '0px'
                }`,
              }}
            >
              <NavLink
                to={{
                  pathname: `/discover`,
                }}
                className="btn-clear nav-link"
              >
                <Discover
                  componentProps={{
                    id: 'discover',
                    className: active === 'discover' && isFinished ? 'active' : '',
                    onClick: handleClick,
                    active: active,
                    binder: bindDiscover,
                    style:
                      isHoveredDiscover && active !== 'discover'
                        ? {
                            backgroundColor: '#f03e76',
                            cursor: 'pointer',
                          }
                        : {},
                  }}
                />
              </NavLink>
              {!isFinished && previousActive.current === 'discover' && nextClickedId > 0 && (
                <ProgressNavBarLayout
                  nextClickedId={nextClickedId}
                  previousClickedId={previousClickedId.current}
                  isLeft={nextClickedId < previousClickedId.current ? -1 : 1}
                />
              )}
            </div>
          </Then>
        </If>

        <If condition={state.isLoggedIn}>
          <Then>
            <div
              style={{
                width: '100px',
                borderBottom: `${
                  (previousActive.current === '' || isFinished) && active === 'profile' ? '4px solid' : '0px'
                }`,
              }}
            >
              <NavLink
                to={{
                  pathname: `/profile`,
                }}
                className="btn-clear nav-link"
              >
                <Profile
                  componentProps={{
                    id: 'profile',
                    className: active === 'profile' && isFinished ? 'active' : '',
                    onClick: handleClick,
                    active: active,
                    binder: bindProfile,
                    avatar: stateShared.userData.avatar || '',
                    style:
                      isHoveredProfile && active !== 'profile'
                        ? {
                            backgroundColor: '#f03e76',
                            cursor: 'pointer',
                          }
                        : {},
                  }}
                />
              </NavLink>
              {!isFinished && previousActive.current === 'profile' && nextClickedId > 0 && (
                <ProgressNavBarLayout
                  nextClickedId={nextClickedId}
                  previousClickedId={previousClickedId.current}
                  isLeft={nextClickedId < previousClickedId.current ? -1 : 1}
                />
              )}
            </div>
          </Then>
        </If>

        <If condition={state.isLoggedIn}>
          <Then>
            <div
              style={{
                width: '100px',
                borderBottom: `${
                  (previousActive.current === '' || isFinished) && active === 'logout' ? '4px solid' : '0px'
                }`,
              }}
            >
              <NavLink
                to={{
                  pathname: `/logout`,
                }}
                className="btn-clear nav-link"
              >
                <Logout
                  componentProps={{
                    id: 'logout',
                    className: active === 'logout' && isFinished ? 'active' : '',
                    onClick: handleClick,
                    active: active,
                    binder: bindLogout,
                    style:
                      isHoveredLogout && active !== 'logout'
                        ? {
                            backgroundColor: '#f03e76',
                            cursor: 'pointer',
                          }
                        : {},
                  }}
                />
              </NavLink>
            </div>
          </Then>
        </If>

        <If condition={!state.isLoggedIn}>
          <Then>
            <div
              style={{
                width: '100px',
                borderBottom: `${
                  (previousActive.current === '' || isFinished) && active === 'login' ? '4px solid' : '0px'
                }`,
              }}
            >
              <NavLink
                to={{
                  pathname: `/login`,
                }}
                className="btn-clear nav-link"
              >
                <Login
                  componentProps={{
                    id: 'login',
                    className: active === 'login' && isFinished ? 'active' : '',
                    onClick: handleClick,
                    active: active,
                    binder: bindLogin,
                    style:
                      isHoveredLogin && active !== 'login'
                        ? {
                            backgroundColor: '#f03e76',
                            cursor: 'pointer',
                          }
                        : {},
                  }}
                />
              </NavLink>
              {!isFinished && previousActive.current === 'login' && nextClickedId > 0 && (
                <ProgressNavBarLayout
                  nextClickedId={nextClickedId}
                  previousClickedId={previousClickedId.current}
                  isLeft={nextClickedId < previousClickedId.current ? -1 : 1}
                />
              )}
            </div>
          </Then>
        </If>
      </ul>
    </div>
  );
};
NavBar.displayName = 'NavBar';
export default React.memo(NavBar);
