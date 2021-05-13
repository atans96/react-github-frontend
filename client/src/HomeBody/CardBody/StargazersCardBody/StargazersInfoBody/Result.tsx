import React, { useState } from 'react';
import { Typography } from '@material-ui/core';
import { useUserCardStyles } from '../../../../DiscoverBody/CardDiscoverBody/UserCardStyle';
import './ResultStyle.scss';
import '../StargazersInfoStyle.scss';
import clsx from 'clsx';
import { StargazerProps } from '../../../../typing/type';
import idx from 'idx';
import { useTrackedStateShared, useTrackedStateStargazers } from '../../../../selectors/stateContextSelector';
import { IStateStargazers } from '../../../../typing/interface';

export interface Result {
  getRootPropsCard: any;
  stargazer: StargazerProps;
  stateStargazers: IStateStargazers;
}

const Result: React.FC<Result> = ({ stargazer, stateStargazers, getRootPropsCard }) => {
  const [, dispatchShared] = useTrackedStateShared();
  const [, dispatchStargazers] = useTrackedStateStargazers();
  const [hovered, setHovered] = useState('');
  const classes = useUserCardStyles();

  const renderStyleEffect = () => {
    let style;
    if (hovered === 'nonDelete') {
      style = { backgroundColor: '#ddd', textAlign: 'left' };
    } else {
      style = { backgroundColor: '#ffffff', transition: 'all 0.1s ease-in', textAlign: 'left' };
    }
    return style;
  };
  const onClickQueue = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatchStargazers({
      type: 'SET_QUEUE_STARGAZERS',
      payload: {
        stargazersQueueData: stargazer,
      },
    });
    const ja = idx(stateStargazers, (_) => _.stargazersData) ?? [];
    const updatedStargazersData = ja.find((obj: StargazerProps) => obj.id === stargazer.id);
    if (updatedStargazersData !== undefined) {
      try {
        updatedStargazersData.isQueue = !updatedStargazersData.isQueue;
      } catch {
        updatedStargazersData['isQueue'] = false;
      }
      dispatchStargazers({
        type: 'STARGAZERS_UPDATED',
        payload: {
          stargazersData: idx(
            stateStargazers,
            (_) =>
              _.stargazersData.map((obj: StargazerProps) => {
                if (obj.id === updatedStargazersData.id) {
                  return updatedStargazersData;
                } else {
                  return obj;
                }
              }) ?? []
          ),
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
    dispatchShared({
      type: 'USERNAME_ADDED',
      payload: {
        username: stargazer.login,
      },
    });
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
                idx(
                  stargazer,
                  (_) =>
                    _.starredRepositories.nodes
                      .map((obj: { languages: { nodes: any[] } }) => obj.languages.nodes[0])
                      .map((x: { name: string }) => x && x.name)
                      .filter((language: string) => language === stateStargazers.language).length
                ) ?? 0
              }
            </Typography>
          </div>
        </td>
      </tr>
    </tbody>
  );
};
export default Result;
