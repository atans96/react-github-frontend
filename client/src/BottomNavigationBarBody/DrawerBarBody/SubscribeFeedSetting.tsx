import React, { useEffect, useState } from 'react';
import { CircularProgress, Collapse, List, ListItem, ListItemIcon, ListItemText, Theme } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import SettingsIcon from '@material-ui/icons/Settings';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import Result from './SubscribFeedSettingBody/Result';
import SendIcon from '@material-ui/icons/Send';
import { NavLink } from 'react-router-dom';
import { IAction, IStateShared } from '../../typing/interface';
import { isEqualObjects } from '../../util';
import { useApolloFactory } from '../../hooks/useApolloFactory';
import { Login } from '../../typing/type';
import { Action } from '../../store/reducer';
import { ActionStargazers } from '../../store/Staargazers/reducer';
import { ActionShared } from '../../store/Shared/reducer';

const useStyles = makeStyles<Theme>(() => ({
  typographyQuery: {
    flex: '0 1 auto',
    marginRight: '5px',
  },
  queryContainer: {
    justifyContent: 'center',
  },
  list: {
    paddingTop: '10px',
    paddingBottom: '80px',
  },
  paperUnseen: {
    marginBottom: '5px',
    padding: '1em',
    background: '#ffcece',
  },
  paper: {
    marginBottom: '5px',
    padding: '1em',
    background: 'var(--background-theme-color)',
  },
  typography: {
    '& .MuiTypography-root': {
      fontSize: '1.5rem',
    },
  },
}));

interface SubscribeFeedSettingProps {
  dispatch: React.Dispatch<IAction<Action>>;
  dispatchStargazersUser: React.Dispatch<IAction<ActionStargazers>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
  stateShared: IStateShared;
}

const SubscribeFeedSetting = React.memo<SubscribeFeedSettingProps>(
  ({ stateShared, dispatch, dispatchShared, dispatchStargazersUser }) => {
    const displayName: string | undefined = (SubscribeFeedSetting as React.ComponentType<any>).displayName;
    const { watchUsersData, loadingWatchUsersData, errorWatchUsersData } = useApolloFactory(
      displayName!
    ).query.getWatchUsers();
    const classes = useStyles();
    const [openSubscriptionSetting, setSubscriptionSetting] = useState(false);
    const [showMoreSubscribedUsers, setShowMoreSubscribedUsers] = useState(false);
    const [loading, setLoading] = useState(false);
    const [subscribedUsers, setSubscribedUsers] = useState<Login[]>([]);
    const handleOpenSubscriptionSetting = (e: React.MouseEvent) => {
      e.preventDefault();
      setSubscriptionSetting(!openSubscriptionSetting);
      setLoading(true);
    };
    const handleShowMoreSubscriptionSetting = (e: React.MouseEvent) => {
      e.preventDefault();
      setShowMoreSubscribedUsers(!showMoreSubscribedUsers);
    };
    const handleSubmitQueue = (e: React.MouseEvent) => {
      e.preventDefault();
      const usernameList = subscribedUsers.reduce((acc: string[], subscribeUser: any) => {
        acc.push(subscribeUser.login);
        return acc;
      }, []);
      dispatch({
        type: 'REMOVE_ALL',
      });
      dispatchShared({
        type: 'USERNAME_ADDED',
        payload: {
          username: usernameList,
        },
      });
    };
    useEffect(() => {
      if (
        !loadingWatchUsersData &&
        !errorWatchUsersData &&
        watchUsersData &&
        watchUsersData.getWatchUsers?.login?.length > 0
      ) {
        const temp = watchUsersData.getWatchUsers.login.reduce((acc: any[], obj: Login) => {
          acc.push(Object.assign({}, { login: obj.login, avatarUrl: obj.avatarUrl }));
          return acc;
        }, []);
        setSubscribedUsers(temp.reverse());
        setLoading(false);
      } else if (
        (!loadingWatchUsersData &&
          !errorWatchUsersData &&
          watchUsersData &&
          watchUsersData?.getWatchUsers?.login?.length === 0) ||
        watchUsersData?.getWatchUsers?.login?.length === undefined
      ) {
        setLoading(false);
        setSubscribedUsers([]);
      }
    }, [openSubscriptionSetting, watchUsersData, loadingWatchUsersData, errorWatchUsersData]);
    return (
      <List className={classes.list}>
        <ListItem button key={'Subscription Setting'} onClick={handleOpenSubscriptionSetting}>
          <ListItemIcon>
            <SettingsIcon style={{ transform: 'scale(1.5)' }} />
          </ListItemIcon>
          <ListItemText primary={'Subscription Setting'} className={classes.typography} />
          {openSubscriptionSetting ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openSubscriptionSetting} timeout="auto" unmountOnExit>
          <If condition={loading}>
            <Then>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </div>
            </Then>
          </If>
          <If condition={!loading && stateShared.isLoggedIn}>
            <Then>
              <div className="SelectMenu-list" style={{ background: 'var(--background-theme-color)' }}>
                <table style={{ marginLeft: '5px', display: 'table', width: '100%' }}>
                  {subscribedUsers.slice(0, 5).map((subscribedUsers, idx) => {
                    return (
                      <Result
                        subscribedUsers={subscribedUsers}
                        key={idx}
                        dispatch={dispatch}
                        dispatchStargazersUser={dispatchStargazersUser}
                      />
                    );
                  })}
                  <If condition={subscribedUsers.length > 5}>
                    <Then>
                      <React.Fragment>
                        <Collapse in={showMoreSubscribedUsers} timeout={0.1} unmountOnExit>
                          {subscribedUsers.slice(5).map((subscribedUsers, idx) => {
                            return (
                              <Result
                                subscribedUsers={subscribedUsers}
                                key={idx}
                                dispatch={dispatch}
                                dispatchStargazersUser={dispatchStargazersUser}
                              />
                            );
                          })}
                        </Collapse>
                        <ListItem button key={'1'} onClick={handleShowMoreSubscriptionSetting}>
                          <ListItemText
                            primary={`${showMoreSubscribedUsers ? 'Hide' : 'Show'} ${subscribedUsers.length - 5} ${
                              !showMoreSubscribedUsers ? 'More' : ''
                            }`}
                          />
                          {showMoreSubscribedUsers ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                      </React.Fragment>
                    </Then>
                  </If>
                </table>
              </div>
            </Then>
          </If>
          <If condition={subscribedUsers.length > 0}>
            <Then>
              <ListItem button className={classes.queryContainer} onClick={handleSubmitQueue}>
                <ListItemText primary={`Query ${subscribedUsers.length} users`} className={classes.typographyQuery} />
                <SendIcon style={{ transform: 'scale(0.5)' }} />
              </ListItem>
            </Then>
          </If>
          <If
            condition={
              stateShared.isLoggedIn &&
              (watchUsersData?.getWatchUsers?.login?.length === undefined ||
                watchUsersData?.getWatchUsers?.login?.length === 0)
            }
          >
            <Then>
              <ListItem className={classes.queryContainer}>
                <div style={{ textAlign: 'center' }}>
                  <ListItemText
                    primary={'No data yet. Please click stargazers to watch the user activities'}
                    className={classes.typographyQuery}
                  />
                </div>
              </ListItem>
            </Then>
          </If>
          <If condition={!loading && !stateShared.isLoggedIn}>
            <Then>
              <div style={{ textAlign: 'center' }}>
                <span>Please Login to access this feature</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button type="button" className="btn btn-primary" style={{ marginBottom: '10px' }}>
                  <NavLink style={{ color: 'white' }} to={{ pathname: '/login' }}>
                    Login
                  </NavLink>
                </button>
              </div>
            </Then>
          </If>
        </Collapse>
      </List>
    );
  },
  (prevProps: any, nextProps: any) => {
    return isEqualObjects(prevProps.stateShared.isLoggedIn, nextProps.stateShared.isLoggedIn);
  }
);
SubscribeFeedSetting.displayName = 'SubscribeFeedSetting';
export default SubscribeFeedSetting;
