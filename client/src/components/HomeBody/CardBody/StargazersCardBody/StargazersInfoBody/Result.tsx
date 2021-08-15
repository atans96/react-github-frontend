import React, { useState } from 'react';
import { Typography } from '@material-ui/core';
import { useUserCardStyles } from '../../../../DiscoverBody/CardDiscoverBody/UserCardStyle';
import './ResultStyle.scss';
import '../StargazersInfoStyle.scss';
import clsx from 'clsx';
import { StargazerProps } from '../../../../../typing/type';
import { detect, map } from 'async';

import { useTrackedStateShared, useTrackedStateStargazers } from '../../../../../selectors/stateContextSelector';
import { IStateStargazers } from '../../../../../typing/interface';

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
    e.stopPropagation();
    dispatchStargazers({
      type: 'SET_QUEUE_STARGAZERS',
      payload: {
        stargazersQueueData: stargazer,
      },
    });
    const ja = stateStargazers.stargazersData || [];
    detect(
      ja,
      (obj: StargazerProps, cb) => {
        if (obj.id === stargazer.id) {
          // @ts-ignore
          cb(null, obj);
          return obj;
        }
      },
      (err, updatedStargazersData) => {
        if (err) {
          throw new Error('err');
        }
        if (updatedStargazersData !== undefined) {
          try {
            updatedStargazersData.isQueue = !updatedStargazersData.isQueue;
          } catch {
            updatedStargazersData['isQueue'] = false;
          }
          map(
            stateStargazers.stargazersData,
            (obj: StargazerProps) => {
              if (obj.id === updatedStargazersData.id) {
                return updatedStargazersData;
              } else {
                return obj;
              }
            },
            (err, result) => {
              if (err) {
                throw new Error('err');
              }
              dispatchStargazers({
                type: 'STARGAZERS_UPDATED',
                payload: {
                  stargazersData: result || [],
                },
              });
            }
          );
        } else {
          stargazer.isQueue = false;
          dispatchStargazers({
            type: 'STARGAZERS_ADDED_WITHOUT_FILTER',
            payload: {
              stargazersData: stargazer,
            },
          });
        }
      }
    );
  };
  const onClick = () => {
    dispatchShared({
      type: 'QUERY_USERNAME',
      payload: {
        queryUsername: stargazer.login,
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
                stargazer.starredRepositories.nodes
                  .map((obj: { languages: { nodes: any[] } }) => obj.languages.nodes[0])
                  .map((x: { name: string }) => x && x.name)
                  .filter((language: string) => language === stateStargazers.language).length || 0
              }
            </Typography>
          </div>
        </td>
      </tr>
    </tbody>
  );
};
export default Result;
