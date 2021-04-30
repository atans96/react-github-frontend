import React from 'react';
import { useUserCardStyles } from './UserCardStyle';
import { Typography } from '@material-ui/core';
import { isEqualObjects } from '../../util';
import { MergedDataProps } from '../../typing/type';
import { useHistory } from 'react-router-dom';
import {
  useTrackedStateDiscover,
  useTrackedStateShared,
  useTrackedStateStargazers,
} from '../../selectors/stateContextSelector';

interface UserCardDiscover {
  data: MergedDataProps;
  sorted: string;
}

const UserCardDiscover = React.memo<UserCardDiscover>(
  ({ data, sorted }) => {
    const classes = useUserCardStyles();
    const { login, avatar_url, html_url } = data.owner;
    const history = useHistory();
    const [, dispatchShared] = useTrackedStateShared();
    const [, dispatchDiscover] = useTrackedStateDiscover();
    const [, dispatchStargazers] = useTrackedStateStargazers();

    function onClick(e: React.MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      history.push('/');
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
    return isEqualObjects(prevProps.data, nextProps.data) && isEqualObjects(prevProps.sorted, nextProps.sorted);
  }
);
UserCardDiscover.displayName = 'UserCardDiscover';
export default UserCardDiscover;
