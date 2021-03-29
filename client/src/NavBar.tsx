import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useHover from './hooks/useHover';
import Profile from './NavBarBody/Profile';
import AuthedHandler from './AuthedHandler';
import Logout from './NavBarBody/Logout';
import Login from './NavBarBody/Login';
import Home from './NavBarBody/Home';
import { IAction, IState, IStateShared } from './typing/interface';
import Discover from './NavBarBody/SearchSuggested';
import { logoutAction } from './util/util';
import { useApolloFactory } from './hooks/useApolloFactory';
import { useHistory } from 'react-router';
import { Action } from './store/Home/reducer';
import { ActionStargazers } from './store/Staargazers/reducer';
import { ActionShared } from './store/Shared/reducer';

interface NavBarProps {
  state: IState;
  stateShared: IStateShared;
  dispatch: React.Dispatch<IAction<Action>>;
  dispatchStargazers: React.Dispatch<IAction<ActionStargazers>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
}

const NavBar: React.FC<{ componentProps: NavBarProps }> = (props) => {
  const [active, setActiveBar] = useState('home');
  const navBarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const url = location.pathname;

  const [isHoveredLogin, bindLogin] = useHover();
  const [isHoveredLogout, bindLogout] = useHover();
  const [isHoveredProfile, bindProfile] = useHover();
  const [isHoveredDiscover, bindDiscover] = useHover();
  const [isHoveredHome, bindHome] = useHover();
  const Active = url.split('/');
  const displayName: string | undefined = (NavBar as React.ComponentType<any>).displayName;
  const { userData, userDataLoading, userDataError } = useApolloFactory(displayName!).query.getUserData();
  // console.log(userData?.getUserData?.avatar);
  useEffect(() => {
    setActiveBar(Active[1] !== '' ? Active[1] : 'home');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  const history = useHistory();
  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault(); // avoid the href "#/""e to be appended in the URL bar when click
    setActiveBar(event.currentTarget.id);
    if (event.currentTarget.id === 'home') {
      history.push('/');
    } else if (event.currentTarget.id === 'logout') {
      logoutAction(history, props.componentProps.dispatchShared);
    } else {
      history.push(`/${event.currentTarget.id.toLowerCase()}`);
    }
  }, []);
  return (
    <div
      className="navbar"
      ref={navBarRef}
      style={{
        marginLeft: `${
          props.componentProps.stateShared.drawerWidth > 60 && location.pathname === '/'
            ? props.componentProps.stateShared.drawerWidth
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
          authenticator={props.componentProps.stateShared.isLoggedIn}
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
          component={Profile}
          authenticator={props.componentProps.stateShared.isLoggedIn}
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
          authenticator={props.componentProps.stateShared.isLoggedIn}
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
          authenticator={!props.componentProps.stateShared.isLoggedIn}
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
NavBar.displayName = 'NavBar';
export default NavBar;
