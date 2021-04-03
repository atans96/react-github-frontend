import React, { useEffect, useRef, useState } from 'react';
import { Typography } from '@material-ui/core';
import { useUserCardStyles } from '../../../../DiscoverBody/CardDiscoverBody/UserCardStyle';
import { If } from '../../../../util/react-if/If';
import { Then } from '../../../../util/react-if/Then';
import { Login } from '../../../../typing/type';
import { useMutation } from '@apollo/client';
import { WATCH_USER_REMOVED } from '../../../../graphql/mutations';
import { GET_WATCH_USERS } from '../../../../graphql/queries';
import useHover from '../../../../hooks/useHover';
import { fastFilter } from '../../../../util';
import {
  useTrackedState,
  useTrackedStateShared,
  useTrackedStateStargazers,
} from '../../../../selectors/stateContextSelector';
import { useLocation } from 'react-router-dom';

interface ResultProps {
  subscribedUsers: Login;
}

const Result: React.FC<ResultProps> = ({ subscribedUsers }) => {
  const classes = useUserCardStyles();
  const [, dispatchShared] = useTrackedStateShared();
  const [, dispatch] = useTrackedState();
  const [, dispatchStargazers] = useTrackedStateStargazers();
  const [isHovered, bind] = useHover();
  const userTextNameRef = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState('');
  const [removed] = useMutation(WATCH_USER_REMOVED, {
    context: { clientName: 'mongo' },
    update: (cache) => {
      const { getWatchUsers }: any = cache.readQuery({
        query: GET_WATCH_USERS,
      });
      const filtered = fastFilter((obj: any) => obj.login !== subscribedUsers.login, getWatchUsers.login);
      cache.writeQuery({
        query: GET_WATCH_USERS,
        data: {
          getWatchUsers: {
            login: filtered,
          },
        },
      });
    },
  });
  const renderStyleEffect = () => {
    let style;
    if (hovered === 'nonDelete') {
      style = { backgroundColor: '#ddd', width: '100%' };
    } else {
      style = { backgroundColor: 'transparent', transition: 'all 0.1s ease-in', width: '100%' };
    }
    return style;
  };
  const handleClickQueryUser = (e: React.MouseEvent) => {
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
        username: subscribedUsers.login,
      },
    });
  };
  const handleClickUnsubscribe = (e: React.MouseEvent) => {
    e.preventDefault();
    removed({
      variables: {
        login: subscribedUsers.login,
      },
    }).then(() => {});
  };

  const location = useLocation();
  useEffect(() => {
    let isFinished = false;
    if (userTextNameRef.current && location.pathname === '/' && !isFinished) {
      if (hovered !== '') {
        userTextNameRef.current.style.textDecoration = 'underline';
        userTextNameRef.current.style.color = 'red';
      } else {
        userTextNameRef.current.style.textDecoration = 'none';
        userTextNameRef.current.style.color = 'black';
      }
      return () => {
        isFinished = true;
      };
    }
  }, [hovered]);

  return (
    <tbody {...bind}>
      <tr>
        <td
          onMouseEnter={() => {
            setHovered('nonDelete');
          }}
          onMouseLeave={() => {
            setHovered('');
          }}
          style={renderStyleEffect()}
          title={'Query this user'}
          onClick={handleClickQueryUser}
        >
          <div className="result">
            <img alt="avatar" className="avatar-img" src={subscribedUsers.avatarUrl} />
            <Typography variant="subtitle2" className={classes.typography} ref={userTextNameRef}>
              {subscribedUsers.login}
            </Typography>
          </div>
        </td>
        <If condition={isHovered}>
          <Then>
            <td onClick={handleClickUnsubscribe} title={'Unsubscribe'}>
              <button style={{ height: '50px', width: '40px', background: 'red', border: '0' }}>
                <span style={{ transform: 'scale(1.5)' }} className="glyphicon glyphicon-remove" />
              </button>
            </td>
          </Then>
        </If>
      </tr>
    </tbody>
  );
};
Result.displayName = 'Result';
export default Result;
