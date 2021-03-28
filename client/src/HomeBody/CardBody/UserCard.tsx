import React from 'react';
import { useUserCardStyles } from './UserCardStyle';
import { dispatchUsername } from '../../store/dispatcher';
import { isEqualObjects } from '../../util';

interface UserCard {
  data: any;
  dispatch: any;
  dispatchStargazers: any;
}

const UserCard = React.memo<UserCard>(
  ({ data, dispatch, dispatchStargazers }) => {
    const classes = useUserCardStyles();
    const { login, avatar_url, html_url } = data.owner;

    function onClick(e: React.MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      dispatch({
        type: 'REMOVE_ALL',
      });
      dispatchStargazers({
        type: 'REMOVE_ALL',
      });
      dispatchUsername(login, dispatch);
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
