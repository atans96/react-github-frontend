import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useHover from './hooks/useHover';
import Profile from './NavBarBody/Profile';
import AuthedHandler from './AuthedHandler';
import Logout from './NavBarBody/Logout';
import Login from './NavBarBody/Login';
import Home from './NavBarBody/Home';
import { IState } from './typing/interface';
import Discover from './NavBarBody/SearchSuggested';
import Trending from './NavBarBody/Trending';
import { logoutAction } from './util/util';
import { useApolloFactory } from './hooks/useApolloFactory';

interface NavBarProps {
  state: IState;
  dispatch: any;
  dispatchStargazers: any;
}

const NavBar: React.FC<{ componentProps: NavBarProps }> = (props) => {
  const [active, setActiveBar] = useState('home');
  const navBarRef = useRef<HTMLDivElement>(null);
  let location = useLocation();
  const url = location.pathname;

  const [isHoveredLogin, bindLogin] = useHover();
  const [isHoveredLogout, bindLogout] = useHover();
  const [isHoveredProfile, bindProfile] = useHover();
  const [isHoveredDiscover, bindDiscover] = useHover();
  const [isHoveredTrending, bindTrending] = useHover();
  const [isHoveredHome, bindHome] = useHover();
  const Active = url.split('/');
  const { userData, userDataLoading, userDataError } = useApolloFactory().query.getUserData;
  useEffect(() => {
    setActiveBar(Active[1] !== '' ? Active[1] : 'home');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault(); // avoid the href "#/""e to be appended in the URL bar when click
    setActiveBar(event.currentTarget.id);
    if (event.currentTarget.id === 'home') {
      window.location.href = '/';
    } else if (event.currentTarget.id === 'logout') {
      logoutAction(props.componentProps.dispatch, props.componentProps.dispatchStargazers);
    } else {
      window.location.href = `/${event.currentTarget.id.toLowerCase()}`;
    }
  };
  return (
    <div
      className="navbar"
      ref={navBarRef}
      style={{
        marginLeft: `${
          props.componentProps.state.drawerWidth > 60 && location.pathname === '/'
            ? props.componentProps.state.drawerWidth
            : 0
        }px`,
      }}
    >
      <ul>
        <AuthedHandler
          component={Home}
          authenticator={true}
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
        <AuthedHandler
          component={Discover}
          authenticator={props.componentProps.state.isLoggedIn}
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
        <AuthedHandler
          component={Trending}
          authenticator={props.componentProps.state.isLoggedIn}
          componentProps={{
            id: 'trending',
            className: active === 'trending' ? 'active' : '',
            onClick: handleClick,
            active: active,
            binder: bindTrending,
            style:
              isHoveredTrending && active !== 'trending'
                ? {
                    backgroundColor: '#f03e76',
                    cursor: 'pointer',
                  }
                : {},
          }}
        />
        <AuthedHandler
          component={Profile}
          authenticator={props.componentProps.state.isLoggedIn}
          componentProps={{
            id: 'profile',
            className: active === 'profile' ? 'active' : '',
            onClick: handleClick,
            active: active,
            binder: bindProfile,
            avatar:
              !userDataLoading && !userDataError && userData && userData.getUserData ? userData.getUserData.avatar : '',
            style:
              isHoveredProfile && active !== 'profile'
                ? {
                    backgroundColor: '#f03e76',
                    cursor: 'pointer',
                  }
                : {},
          }}
        />
        <AuthedHandler
          component={Logout}
          authenticator={props.componentProps.state.isLoggedIn}
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
        <AuthedHandler
          component={Login}
          authenticator={!props.componentProps.state.isLoggedIn}
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
      </ul>
    </div>
  );
};
export default NavBar;
