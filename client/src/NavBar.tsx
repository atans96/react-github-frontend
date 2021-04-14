import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useHover from './hooks/useHover';
import Profile from './NavBarBody/Profile';
import Logout from './NavBarBody/Logout';
import Login from './NavBarBody/Login';
import Home from './NavBarBody/Home';
import Discover from './NavBarBody/SearchSuggested';
import { logoutAction } from './util/util';
import { useApolloFactory } from './hooks/useApolloFactory';
import { useHistory } from 'react-router-dom';
import { If } from './util/react-if/If';
import { Then } from './util/react-if/Then';
import { useTrackedStateShared } from './selectors/stateContextSelector';
import { ProgressNavBar } from './Layout/ProgressNavBar';

const directionLogin = new Map(
  [
    { path: 'home', index: 1 },
    { path: 'discover', index: 2 },
    { path: 'profile', index: 3 },
    { path: 'logout', index: 4 },
  ].map((i) => [i.path, i.index])
);
const directionNotLogin = new Map(
  [
    { path: 'home', index: 1 },
    { path: 'login', index: 2 },
  ].map((i) => [i.path, i.index])
);

const NavBar = React.memo(() => {
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
  const displayName: string | undefined = (NavBar as React.ComponentType<any>).displayName;
  const { userData, userDataLoading, userDataError } = useApolloFactory(displayName!).query.getUserData();

  const te = Active[1] !== '' ? Active[1] : 'home';
  const number = state.isLoggedIn ? directionLogin.get(te) : directionNotLogin.get(te);
  const [nextClickedId, setNextClickedId] = useState<number>(number || 0);
  const previousClickedId = useRef<number>(number || 0);
  const previousActive = useRef<string>('');
  const [isFinished, setIsFinished] = useState<boolean>(true);

  const history = useHistory();
  useEffect(() => {
    setActiveBar(Active[1] !== '' ? Active[1] : 'home'); //handle the case where you enter /profile directly instead of clicking
    if (previousActive.current.length > 0) {
      setIsFinished(previousActive.current.length > 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleClickHistory = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault(); // avoid the href "#/""e to be appended in the URL bar when click
    const res = event.currentTarget.id;
    setIsFinished(false);
    setActiveBar((prevState: string) => {
      previousActive.current = prevState;
      return res;
    });
    if (!state.isLoggedIn) {
      const res = directionNotLogin.get(event.currentTarget.id) || -1;
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
      const res = directionLogin.get(event.currentTarget.id) || -1;
      setNextClickedId((prevState) => {
        previousClickedId.current = prevState;
        return res;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.isLoggedIn && active) {
      // setTimeout(() => {
      //   //because it takes time to render, we need to setTimeout to wait a little bit to determine the full height
      //   if (active === 'home') {
      //     history.push('/');
      //   } else if (active === 'logout') {
      //     logoutAction(history, dispatch);
      //   } else {
      //     history.push(`/${active.toLowerCase()}`);
      //   }
      // }, 1500);
      if (active === 'home') {
        history.push('/');
      } else if (active === 'logout') {
        logoutAction(history, dispatch);
      } else {
        history.push(`/${active.toLowerCase()}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div
      className="navbar"
      ref={navBarRef}
      style={{
        marginLeft: `${state.drawerWidth > 60 && location.pathname === '/' ? state.drawerWidth : 0}px`,
      }}
    >
      <ul>
        <div
          style={{
            width: '100px',
            borderBottom: `${(previousActive.current === '' || isFinished) && active === 'home' ? '4px solid' : '0px'}`,
          }}
          id={'1'}
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
                onClick: handleClickHistory,
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
            <ProgressNavBar nextClickedId={nextClickedId} previousClickedId={previousClickedId.current} isLeft={1} />
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
              id={'2'}
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
                    onClick: handleClickHistory,
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
                <ProgressNavBar
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
              id={'3'}
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
                    onClick: handleClickHistory,
                    active: active,
                    binder: bindProfile,
                    avatar:
                      !userDataLoading && !userDataError && userData && userData.getUserData
                        ? userData.getUserData.avatar
                        : '',
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
                <ProgressNavBar
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
              id={'4'}
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
                    onClick: handleClickHistory,
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
              id={'2'}
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
                    onClick: handleClickHistory,
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
                <ProgressNavBar
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
});
NavBar.displayName = 'NavBar';
export default NavBar;
