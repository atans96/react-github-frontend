import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MergedDataProps } from '../typing/type';
import clsx from 'clsx';
import { useApolloFactory } from '../hooks/useApolloFactory';
import { noop } from '../util/util';
import UserCardDiscover from './CardDiscoverBody/UserCardDiscover';
import StargazersDiscover from './CardDiscoverBody/StargazersDiscover';
import Loadable from 'react-loadable';
import { useStableCallback } from '../util';
import './CardDiscover.scss';
import Empty from '../Layout/EmptyLayout';
import { SharedStore } from '../store/Shared/reducer';

const ImagesCardDiscover = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "ImagesCardDiscover" */ './CardDiscoverBody/ImagesCardDiscover'),
});

export interface Card {
  index: number;
  githubData: MergedDataProps;
}

interface CardRef extends Card {
  columnCount: number;
  imagesMapDataDiscover: Map<number, any>;
  sorted: string;
}

const CardDiscover: React.FC<CardRef> = ({ githubData, index, columnCount, imagesMapDataDiscover, sorted }) => {
  // when the autocomplete list are showing, use z-index so that it won't appear in front of the list of autocomplete
  // when autocomplete is hidden, don't use z-index since we want to work with changing the cursor and clickable (z-index -1 can't click it)
  const userCardMemoizedData = useStableCallback(() => githubData);
  const stargazersMemoizedGithubData = useStableCallback(() => githubData);

  const displayName: string | undefined = (CardDiscover as React.ComponentType<any>).displayName;
  const clickedAdded = useApolloFactory(displayName!).mutation.clickedAdded;
  const mouseDownHandler = (event: React.MouseEvent) => {
    event.preventDefault();
    if (event.button === 1) {
      localStorage.setItem('detailsData', JSON.stringify({ data: githubData, path: location.pathname }));
      // history.push(`/detail/${githubData.id}`);
      window.open(`/detail/${githubData.id}`);
      const temp = [
        Object.assign(
          {},
          {
            full_name: githubData.full_name,
            owner: {
              login: githubData.owner.login,
            },
            is_queried: false,
          }
        ),
      ];
      clickedAdded({
        getClicked: {
          clicked: temp,
        },
      }).then(noop);
    }
  };
  const handleDetailsClicked = (e: React.MouseEvent) => {
    e.preventDefault();
    const temp = [
      Object.assign(
        {},
        {
          full_name: githubData.full_name,
          owner: {
            login: githubData.owner.login,
          },
          is_queried: false,
        }
      ),
    ];
    clickedAdded({
      getClicked: {
        clicked: temp,
      },
    }).then(noop);
  };
  const location = useLocation();
  if (!githubData) return <p>No githubData, sorry</p>;
  return (
    <div
      className={clsx('card bg-light fade-in', {
        'card-width-mobile': columnCount === 1,
      })}
    >
      <UserCardDiscover data={userCardMemoizedData()} sorted={sorted} />
      <h3 style={{ textAlign: 'center' }}>
        <strong>{githubData.name.toUpperCase().replace(/[_-]/g, ' ')}</strong>
      </h3>
      {imagesMapDataDiscover.size > 0 && (
        <ImagesCardDiscover index={index} imagesMapDataDiscover={imagesMapDataDiscover} />
      )}

      <div className="trunctuatedTexts">
        <h4 style={{ textAlign: 'center' }}>{githubData.description}</h4>
      </div>
      <StargazersDiscover data={stargazersMemoizedGithubData()} />
      <div>
        <ul
          className={`language}`}
          style={{
            backgroundColor: 'transparent',
            color: SharedStore.store()
              .GithubLanguages()
              .githubLanguages.get(githubData?.language?.replace(/\+\+|#|\s/, '-'))?.color,
          }}
        >
          <li className={'language-list'}>
            <h6 style={{ color: 'black', width: 'max-content' }}>{githubData.language}</h6>
          </li>
        </ul>
      </div>
      <div style={{ textAlign: 'center' }} onClick={handleDetailsClicked}>
        <a href={githubData.html_url} target="_blank" rel="noopener noreferrer">
          {githubData.html_url}
        </a>
      </div>
      <div className="details" onClick={handleDetailsClicked} onMouseDown={mouseDownHandler}>
        <NavLink
          to={{
            pathname: `/detail/${githubData.id}`,
            state: JSON.stringify({ data: githubData, path: location.pathname }),
          }}
          className="btn-clear nav-link"
        >
          <p>MORE DETAILS</p>
        </NavLink>
      </div>
    </div>
  );
};
CardDiscover.displayName = 'CardDiscover';
export default CardDiscover;
