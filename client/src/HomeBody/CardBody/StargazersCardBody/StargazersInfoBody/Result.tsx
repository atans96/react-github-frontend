import React, { useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';
import { dispatchUsername } from '../../../../store/dispatcher';
import { useUserCardStyles } from '../../UserCardStyle';
import './ResultStyle.scss';
import '../StargazersInfoStyle.scss';
import clsx from 'clsx';
import { IStateStargazers } from '../../../../typing/interface';
import { StargazerProps } from '../../../../typing/type';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { useMutation } from '@apollo/client';
import { WATCH_USER_REMOVED } from '../../../../mutations';
import { GET_WATCH_USERS } from '../../../../queries';
import { fastFilter } from '../../../../util';
import {useApolloFactory} from "../../../../hooks/useApolloFactory";

export interface Result {
  getRootPropsCard: any;
  stargazer: StargazerProps;
  stateStargazers: IStateStargazers;
  javascriptWidth?: number;
  dispatch: any;
  dispatchStargazers: any;
}

const Result: React.FC<Result> = ({ stateStargazers, dispatchStargazers, dispatch, stargazer, getRootPropsCard }) => {
  const [hovered, setHovered] = useState('');
  const classes = useUserCardStyles();
  const { watchUsersData, loadingWatchUsersData, errorWatchUsersData } = useApolloFactory().query.getWatchUsers;
  const [removed] = useMutation(WATCH_USER_REMOVED, {
    context: { clientName: 'mongo' },
    update: (cache) => {
      const { getWatchUsers }: any = cache.readQuery({
        query: GET_WATCH_USERS,
      });
      const filtered = fastFilter((obj: any) => obj.login !== stargazer.login, getWatchUsers.login);
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
  useEffect(() => {
    if (!loadingWatchUsersData && !errorWatchUsersData && watchUsersData && watchUsersData.getWatchUsers?.login) {
      setSubscribe(watchUsersData.getWatchUsers?.login?.find((obj: any) => obj.login === stargazer.login));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchUsersData, loadingWatchUsersData, errorWatchUsersData]);
  const [subscribe, setSubscribe] = useState(false);
  const renderStyleEffect = () => {
    let style;
    if (hovered === 'nonDelete') {
      style = { backgroundColor: '#ddd', textAlign: 'left' };
    } else {
      style = { backgroundColor: '#ffffff', transition: 'all 0.1s ease-in', textAlign: 'left' };
    }
    return style;
  };
  const watchUsersAdded = useApolloFactory().mutation.watchUsersAdded;
  const onClickSubscribe = (e: React.MouseEvent) => {
    e.preventDefault();
    let subscribeStatus: boolean;
    if (!watchUsersData?.getWatchUsers?.login?.find((obj: any) => obj.login === stargazer.login)) {
      setSubscribe(true);
      subscribeStatus = true;
    } else {
      setSubscribe(false);
      subscribeStatus = false;
    }
    if (subscribeStatus) {
      watchUsersAdded({
        variables: {
          login: Object.assign(
            {},
            { id: stargazer.id, login: stargazer.login, createdAt: Date.now(), avatarUrl: stargazer.avatarUrl }
          ),
        },
      }).then(() => {});
    } else {
      removed({
        variables: {
          login: stargazer.login,
        },
      }).then(() => {});
    }
  };
  const onClickQueue = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatchStargazers({
      type: 'SET_QUEUE_STARGAZERS',
      payload: {
        stargazersQueueData: stargazer,
      },
    });
    const updatedStargazersData = stateStargazers.stargazersData.find((obj: StargazerProps) => obj.id === stargazer.id);
    if (updatedStargazersData !== undefined) {
      try {
        updatedStargazersData.isQueue = !updatedStargazersData.isQueue;
      } catch {
        updatedStargazersData['isQueue'] = false;
      }
      dispatchStargazers({
        type: 'STARGAZERS_UPDATED',
        payload: {
          stargazersData: stateStargazers.stargazersData.map((obj: StargazerProps) => {
            if (obj.id === updatedStargazersData.id) {
              return updatedStargazersData;
            } else {
              return obj;
            }
          }),
        },
      });
    } else {
      stargazer.isQueue = false;
      dispatchStargazers({
        type: 'STARGAZERS_ADDED_WITHOUT_FILTER',
        payload: {
          stargazersData: stargazer,
        },
      });
    }
  };
  const onClick = () => {
    dispatch({
      type: 'REMOVE_ALL',
    });
    dispatchStargazers({
      type: 'REMOVE_ALL',
    });
    dispatchUsername(stargazer.login, dispatch);
  };
  return (
    <tbody className={'drags'}>
      <tr>
        <td title={!stargazer.isQueue ? 'Put user in queue.' : 'In queue'} onClick={onClickQueue}>
          <div className="queue" style={{ background: `${stargazer.isQueue ? '#1aff00' : ''}` }}>
            <span
              className={clsx('glyphicon', {
                'glyphicon-ok': stargazer.isQueue,
                'glyphicon-unchecked': !stargazer.isQueue,
              })}
            />
          </div>
        </td>
        <td
          title={!stargazer.isSubscribed ? 'Subscribe user to watch their activities.' : 'Subscribed'}
          onClick={onClickSubscribe}
        >
          <div className="queue" style={{ background: `${subscribe ? '#1aff00' : ''}` }}>
            <VisibilityIcon />
          </div>
        </td>
        <td
          {...getRootPropsCard({ onClick })}
          onMouseEnter={() => {
            setHovered('nonDelete');
          }}
          onMouseLeave={() => {
            setHovered('');
          }}
          style={renderStyleEffect()}
        >
          <div className="result">
            <img alt="avatar" className="avatar-img" src={stargazer.avatarUrl} />
            <Typography variant="subtitle2" className={classes.typography}>
              {stargazer.login}
            </Typography>
          </div>
        </td>
        <td
          {...getRootPropsCard({ onClick })}
          onMouseEnter={() => {
            setHovered('nonDelete');
          }}
          onMouseLeave={() => {
            setHovered('');
          }}
          style={renderStyleEffect()}
        >
          <div className="result-languages">
            <Typography variant="subtitle2" className={classes.typography}>
              {
                // filter will get updated when state.language changes due to LanguagesList.tsx click event
                stargazer.starredRepositories.nodes
                  .map((obj: { languages: { nodes: any[] } }) => obj.languages.nodes[0])
                  .map((x: { name: string }) => x && x.name)
                  .filter((language: string) => language === stateStargazers.language).length
              }
            </Typography>
          </div>
        </td>
      </tr>
    </tbody>
  );
};
export default Result;
