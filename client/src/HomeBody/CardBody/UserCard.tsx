import React from 'react';
import { useUserCardStyles } from './UserCardStyle';
import { isEqualObjects } from '../../util';
import { IAction } from '../../typing/interface';
import { ActionShared } from '../../store/Shared/reducer';
import { Action } from '../../store/Home/reducer';
import { ActionStargazers } from '../../store/Staargazers/reducer';
import { OwnerProps } from '../../typing/type';

interface UserCard {
  data: OwnerProps;
  dispatch: React.Dispatch<IAction<Action>>;
  dispatchStargazers: React.Dispatch<IAction<ActionStargazers>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
}

const UserCard = React.memo<UserCard>(
  ({ data, dispatch, dispatchStargazers, dispatchShared }) => {
    const classes = useUserCardStyles();
    const { login, avatar_url, html_url } = data;

    function onClick(e: React.MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      dispatch({
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
          </div>
        </div>
      </div>
    );
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.data, nextProps.data) && isEqualObjects(prevProps.routerProps, nextProps.routerProps)
    );
  }
);
UserCard.displayName = 'UserCard';
export default UserCard;
