import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import Profile from './NavBarBody/Profile';
import Logout from './NavBarBody/Logout';
import Login from './NavBarBody/Login';
import Home from './NavBarBody/Home';
import Discover from './NavBarBody/SearchSuggested';
import { logoutAction } from '../util/util';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
import { useTrackedStateShared } from '../selectors/stateContextSelector';
import { useStableCallback } from '../util';
import DbCtx from '../db/db.ctx';

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
  const { clear } = DbCtx.useContainer();
  const abortController = new AbortController();
  const [state, dispatch] = useTrackedStateShared();
  const [active, setActiveBar] = useState<any>('');
  const navBarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const Active = location.pathname.replace('/', '');

  const te = Active[1] !== '' ? Active[1] : 'home';
  const number = state.isLoggedIn ? directionLogin?.get(te)?.index : directionNotLogin?.get(te)?.index;
  const [nextClickedId, setNextClickedId] = useState<number>(number || 0);
  const previousClickedId = useRef<number>(number || 0);
  const previousActive = useRef<string>('');
  const [isFinished, setIsFinished] = useState<boolean>(true);
  const history = useHistory();
  const isFinishedRef = useRef(false);

  useEffect(() => {
    return () => {
      isFinishedRef.current = true;
      abortController.abort(); //cancel the fetch when the user go away from current page or when typing again to search
    };
  }, []);

  useEffect(() => {
    if (
      !isFinishedRef.current &&
      (state.isLoggedIn ? directionLogin : directionNotLogin).get(Active !== '' ? Active : 'home')
    ) {
      setActiveBar(Active !== '' ? Active : 'home'); //handle the case where you enter /profile directly instead of clicking
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/' && !isFinishedRef.current) {
      dispatch({
        //handle the case when the user directly go to /profile url
        type: 'SET_SHOULD_RENDER',
        payload: {
          shouldRender: Active,
        },
      });
      setActiveBar(Active !== '' ? Active : 'home');
    }
  }, []);

  const handleClick = useStableCallback((event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation(); // avoid the href "#/""e to be appended in the URL bar when click
    if (event.currentTarget.id !== 'home') {
      //this is because we don't want to render Home until the user submit form via SearchBar
      dispatch({
        type: 'SET_SHOULD_RENDER',
        payload: {
          shouldRender: event.currentTarget.id,
        },
      });
    }
    const res = event.currentTarget.id;
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
        logoutAction(history, dispatch, state.username);
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
    if (!isFinishedRef.current && state.isLoggedIn && active && !directionLogin?.get(active.toLowerCase())?.explored) {
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
        clear();
        logoutAction(history, dispatch, state.username);
      } else {
        history.push({
          pathname: `/${active.toLowerCase()}`,
        });
      }
    } else if (!isFinishedRef.current && directionLogin?.get(active.toLowerCase())?.explored) {
      setIsFinished(true);
      if (active === 'home') {
        history.push('/');
      } else if (active === 'logout') {
        clear();
        logoutAction(history, dispatch, state.username);
      } else {
        history.push({ pathname: `/${active.toLowerCase()}` });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <>
      <div className="navbar" ref={navBarRef}>
        <ul>
          <div
            style={{
              width: '100px',
              borderBottom: `${
                (previousActive.current === '' || isFinished) && active === 'home' ? '4px solid' : '0px'
              }`,
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
                  onClick: handleClick,
                  active: active,
                }}
              />
            </NavLink>
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
                      onClick: handleClick,
                      active: active,
                    }}
                  />
                </NavLink>
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
                      onClick: handleClick,
                      active: active,
                      avatar: state.userData.avatar || '',
                    }}
                  />
                </NavLink>
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
                      onClick: handleClick,
                      active: active,
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
                      onClick: handleClick,
                      active: active,
                    }}
                  />
                </NavLink>
              </div>
            </Then>
          </If>
        </ul>
      </div>
    </>
  );
};
NavBar.displayName = 'NavBar';
export default React.memo(NavBar);
