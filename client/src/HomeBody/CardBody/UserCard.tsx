import React from 'react';
import { useUserCardStyles } from '../../DiscoverBody/CardDiscoverBody/UserCardStyle';
import { OwnerProps } from '../../typing/type';
import {
  useTrackedState,
  useTrackedStateShared,
  useTrackedStateStargazers,
} from '../../selectors/stateContextSelector';

interface UserCard {
  data: OwnerProps;
}

const UserCard: React.FC<UserCard> = ({ data }) => {
  const classes = useUserCardStyles();
  const { login, avatar_url, html_url } = data;
  const [, dispatch] = useTrackedState();
  const [, dispatchShared] = useTrackedStateShared();
  const [, dispatchStargazers] = useTrackedStateStargazers();

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
};
UserCard.displayName = 'UserCard';
export default UserCard;
