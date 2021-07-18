import React from 'react';
import { useUserCardStyles } from './UserCardStyle';
import { Typography } from '@material-ui/core';
import { MergedDataProps } from '../../typing/type';
import { useHistory } from 'react-router-dom';
import { SharedStore } from '../../store/Shared/reducer';
import { StargazersStore } from '../../store/Staargazers/reducer';
import { DiscoverStore } from '../../store/Discover/reducer';

interface UserCardDiscover {
  data: MergedDataProps;
  sorted: string;
}

const UserCardDiscover: React.FC<UserCardDiscover> = React.memo(
  ({ data, sorted }) => {
    const classes = useUserCardStyles();
    const { login, avatar_url, html_url } = data.owner;
    const history = useHistory();

    function onClick(e: React.MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      history.push('/');
      DiscoverStore.dispatch({
        type: 'REMOVE_ALL',
      });
      StargazersStore.dispatch({
        type: 'REMOVE_ALL',
      });
      SharedStore.dispatch({
        type: 'QUERY_USERNAME',
        payload: {
          queryUsername: login,
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
            <a href={html_url} target="_blank" rel="noopener noreferrer" onClick={onClick}>
              <strong>{login}</strong>
            </a>
            <Typography
              style={{ fontSize: '14px' }}
              color="textSecondary"
              variant="body2"
              className={classes.typographySmall}
            >
              Star added {sorted}: + <strong style={{ color: 'green' }}>{data.trends}</strong>
            </Typography>
          </div>
        </div>
      </div>
    );
  },
  (prevProps: any, nextProps: any) => {
    return prevProps.data.owner.avatar_url === nextProps.data.owner.avatar_url && prevProps.sorted === nextProps.sorted;
  }
);
UserCardDiscover.displayName = 'UserCardDiscover';
export default UserCardDiscover;
