import React, { useCallback, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MergedDataProps } from '../typing/type';
import clsx from 'clsx';
import ImagesCardDiscover from './CardDiscoverBody/ImagesCardDiscover';
import { useApolloFactory } from '../hooks/useApolloFactory';
import { noop } from '../util/util';
import UserCardDiscover from './CardDiscoverBody/UserCardDiscover';
import StargazersDiscover from './CardDiscoverBody/StargazersDiscover';
import { StateStargazersProvider } from '../selectors/stateContextSelector';
import { useViewportSpy } from '../hooks/use-viewport-spy';
import { createRenderElement } from '../Layout/MasonryLayout';

export interface Card {
  index: number;
  githubData: MergedDataProps;
}

interface CardRef extends Card {
  columnCount: number;
  imagesMapDataDiscover: Map<number, any>;
  sorted: string;
}

const CardDiscover: React.FC<CardRef> = React.forwardRef(
  ({ githubData, index, columnCount, imagesMapDataDiscover, sorted }, ref) => {
    // when the autocomplete list are showing, use z-index so that it won't appear in front of the list of autocomplete
    // when autocomplete is hidden, don't use z-index since we want to work with changing the cursor and clickable (z-index -1 can't click it)
    const userCardMemoizedData = useCallback(() => {
      return githubData;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [githubData.owner, githubData.trends, sorted]);

    const stargazersMemoizedGithubData = useCallback(() => {
      return githubData;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [githubData.name, githubData.owner.login, githubData.full_name, githubData.id, githubData.stargazers_count]);

    const displayName: string | undefined = (CardDiscover as React.ComponentType<any>).displayName;
    const clickedAdded = useApolloFactory(displayName!).mutation.clickedAdded;
    const mouseDownHandler = (event: React.MouseEvent) => {
      event.preventDefault();
      if (event.button === 1) {
        localStorage.setItem('detailsData', JSON.stringify({ data: githubData, path: location.pathname }));
        // history.push(`/detail/${githubData.id}`);
        window.open(`/detail/${githubData.id}`);
        clickedAdded({
          variables: {
            clickedInfo: [
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
            ],
          },
        }).then(noop);
      }
    };
    const handleDetailsClicked = (e: React.MouseEvent) => {
      e.preventDefault();
      clickedAdded({
        variables: {
          clickedInfo: [
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
          ],
        },
      }).then(noop);
    };
    const isVisibleRef = useRef<HTMLDivElement>(null);
    const isVisible = useViewportSpy(isVisibleRef);
    const location = useLocation();
    if (!githubData) return <p>No githubData, sorry</p>;
    return (
      <div
        className={clsx('card bg-light fade-in', {
          'card-width-mobile': columnCount === 1,
        })}
        ref={isVisibleRef}
      >
        <StateStargazersProvider>
          {createRenderElement(UserCardDiscover, { data: userCardMemoizedData(), sorted })}
        </StateStargazersProvider>
        <h3 style={{ textAlign: 'center' }}>
          <strong>{githubData.name.toUpperCase().replace(/[_-]/g, ' ')}</strong>
        </h3>
        {createRenderElement(ImagesCardDiscover, { index: index, visible: isVisible || false, imagesMapDataDiscover })}
        <div className="trunctuatedTexts">
          <h4 style={{ textAlign: 'center' }}>{githubData.description}</h4>
        </div>
        {createRenderElement(StargazersDiscover, { data: stargazersMemoizedGithubData() })}
        <div className={'language-github-color'}>
          <ul
            className={`language ${githubData?.language?.replace(/\+\+|#|\s/, '-')}`}
            style={{ backgroundColor: 'transparent' }}
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
  }
);
CardDiscover.displayName = 'CardDiscover';
export default CardDiscover;
