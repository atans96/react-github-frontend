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

const NavBar = React.memo(() => {
  const [state, dispatch] = useTrackedStateShared();
  const [active, setActiveBar] = useState('home');
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
  // console.log(userData?.getUserData?.avatar);
  useEffect(() => {
    setActiveBar(Active[1] !== '' ? Active[1] : 'home');
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const history = useHistory();

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault(); // avoid the href "#/""e to be appended in the URL bar when click
    setActiveBar(event.currentTarget.id);
    if (event.currentTarget.id === 'home') {
      history.push('/');
    } else if (event.currentTarget.id === 'logout') {
      logoutAction(history, dispatch);
    } else {
      history.push(`/${event.currentTarget.id.toLowerCase()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="navbar"
      ref={navBarRef}
      style={{
        marginLeft: `${state.drawerWidth > 60 && location.pathname === '/' ? state.drawerWidth : 0}px`,
      }}
    >
      <ul>
        <NavLink
          to={{
            pathname: `/`,
          }}
          className="btn-clear nav-link"
        >
          <Home
            componentProps={{
              id: 'home',
              className: active === 'home' ? 'active' : '',
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

        <If condition={state.isLoggedIn}>
          <Then>
            <NavLink
              to={{
                pathname: `/discover`,
              }}
              className="btn-clear nav-link"
            >
              <Discover
                componentProps={{
                  id: 'discover',
                  className: active === 'discover' ? 'active' : '',
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
          </Then>
        </If>

        <If condition={state.isLoggedIn}>
          <Then>
            <NavLink
              to={{
                pathname: `/profile`,
              }}
              className="btn-clear nav-link"
            >
              <Profile
                componentProps={{
                  id: 'profile',
                  className: active === 'profile' ? 'active' : '',
                  onClick: handleClick,
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
          </Then>
        </If>

        <If condition={state.isLoggedIn}>
          <Then>
            <Logout
              componentProps={{
                id: 'logout',
                className: active === 'logout' ? 'active' : '',
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
          </Then>
        </If>

        <If condition={!state.isLoggedIn}>
          <Then>
            <NavLink
              to={{
                pathname: `/login`,
              }}
              className="btn-clear nav-link"
            >
              <Login
                componentProps={{
                  id: 'login',
                  className: active === 'login' ? 'active' : '',
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
          </Then>
        </If>
      </ul>
    </div>
  );
});
NavBar.displayName = 'NavBar';
export default NavBar;
