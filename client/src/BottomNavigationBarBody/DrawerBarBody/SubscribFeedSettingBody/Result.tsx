import React, { useEffect, useRef, useState } from 'react';
import { Typography } from '@material-ui/core';
import { useUserCardStyles } from '../../../HomeBody/CardBody/UserCardStyle';
import { If } from '../../../util/react-if/If';
import { Then } from '../../../util/react-if/Then';
import { Login } from '../../../typing/type';
import { useMutation } from '@apollo/client';
import { WATCH_USER_REMOVED } from '../../../mutations';
import { GET_WATCH_USERS } from '../../../queries';
import useHover from '../../../hooks/useHover';
import { fastFilter } from '../../../util';
import { IAction } from '../../../typing/interface';
import { ActionShared } from '../../../store/Shared/reducer';
import { ActionStargazers } from '../../../store/Staargazers/reducer';
import { Action } from '../../../store/Home/reducer';

interface ResultProps {
  subscribedUsers: Login;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
  dispatchStargazersUser: React.Dispatch<IAction<ActionStargazers>>;
  dispatch: React.Dispatch<IAction<Action>>;
}

const Result: React.FC<ResultProps> = ({ subscribedUsers, dispatchShared, dispatch, dispatchStargazersUser }) => {
  const classes = useUserCardStyles();
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
    dispatchStargazersUser({
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
  useEffect(() => {
    if (userTextNameRef.current) {
      if (hovered !== '') {
        userTextNameRef.current.style.textDecoration = 'underline';
        userTextNameRef.current.style.color = 'red';
      } else {
        userTextNameRef.current.style.textDecoration = 'none';
        userTextNameRef.current.style.color = 'black';
      }
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
export default Result;
