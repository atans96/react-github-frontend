import React from 'react';
import { useUserCardStyles } from './UserCardStyle';
import { Typography } from '@material-ui/core';
import { isEqualObjects } from '../../util';
import { RouteComponentProps } from 'react-router-dom';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { ActionDiscover } from '../../store/Discover/reducer';
import { ActionStargazers } from '../../store/Staargazers/reducer';
import { ActionShared } from '../../store/Shared/reducer';
import { IAction } from '../../typing/interface';

interface UserCardDiscover {
  data: any;
  sorted: string;
  routerProps: RouteComponentProps<Record<string, any>, Record<string, any>, Record<string, any>>;
  dispatchDiscover: React.Dispatch<IAction<ActionDiscover>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
  dispatchStargazers: React.Dispatch<IAction<ActionStargazers>>;
}

const UserCardDiscover = React.memo<UserCardDiscover>(
  ({ data, sorted, routerProps, dispatchShared, dispatchDiscover, dispatchStargazers }) => {
    const classes = useUserCardStyles();
    const { login, avatar_url, html_url } = data.owner;

    function onClick(e: React.MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      routerProps.history.push('/');
      dispatchDiscover({
        type: 'REMOVE_ALL',
      });
      dispatchStargazers({
        type: 'REMOVE_ALL',
      });
      dispatchShared({
        type: 'USERNAME_ADDED',
        payload: {
          username: login,
        },
      });
    }

    return (
      <div className="avatarBackground">
        <div className={classes.wrapper}>
          <div>
            <img alt="avatar" className="avatar-img" src={avatar_url} />
          </div>
          <div className={classes.nameWrapper}>
            <a href={html_url} onClick={onClick}>
              <strong>{login}</strong>
            </a>
            <If condition={data.trends}>
              <Then>
                <Typography
                  style={{ fontSize: '14px' }}
                  color="textSecondary"
                  variant="body2"
                  className={classes.typographySmall}
                >
                  Star added {sorted}: + <strong style={{ color: 'green' }}>{data.trends}</strong>
                </Typography>
              </Then>
            </If>
          </div>
        </div>
      </div>
    );
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.data, nextProps.data) &&
      isEqualObjects(prevProps.routerProps, nextProps.routerProps) &&
      isEqualObjects(prevProps.sorted, nextProps.sorted)
    );
  }
);
UserCardDiscover.displayName = 'UserCardDiscover';
export default UserCardDiscover;
