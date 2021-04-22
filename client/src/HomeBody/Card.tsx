import React, { useCallback, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import UserCard from './CardBody/UserCard';
import TopicsCard from './CardBody/TopicsCard';
import Stargazers from './CardBody/Stargazers';
import { MergedDataProps } from '../typing/type';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
import clsx from 'clsx';
import ImagesCard from './CardBody/ImagesCard';
import { useApolloFactory } from '../hooks/useApolloFactory';
import { noop } from '../util/util';
import { useTrackedStateShared } from '../selectors/stateContextSelector';
import { useViewportSpy } from '../hooks/use-viewport-spy';
import { createRenderElement } from '../Layout/MasonryLayout';

export interface Card {
  index: number;
  githubData: MergedDataProps;
  getRootProps?: any;
}

interface CardRef extends Card {
  columnCount: number;
}
const Card: React.FC<CardRef> = ({ columnCount, githubData, index, getRootProps }) => {
  // when the autocomplete list are showing, use z-index so that it won't appear in front of the list of autocomplete
  // when autocomplete is hidden, don't use z-index since we want to work with changing the cursor and clickable (z-index -1 can't click it)
  const [stateShared] = useTrackedStateShared();
  const displayName: string | undefined = (Card as React.ComponentType<any>).displayName;
  const clickedAdded = useApolloFactory(displayName!).mutation.clickedAdded;

  const userCardMemoizedData = useCallback(() => {
    return githubData.owner;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [githubData.owner]);

  const topicsCardMemoizedData = useCallback(() => {
    return githubData.topics;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [githubData.topics]);

  const stargazersMemoizedGithubData = useCallback(() => {
    return githubData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [githubData.name, githubData.owner.login, githubData.full_name, githubData.id]);
  const mouseDownHandler = (event: React.MouseEvent) => {
    event.preventDefault();
    if (event.button === 1) {
      localStorage.setItem('detailsData', JSON.stringify({ data: githubData, path: location.pathname }));
      // history.push(`/detail/${githubData.id}`);
      window.open(`/detail/${githubData.id}`);
      if (stateShared.isLoggedIn) {
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
    }
  };
  const handleDetailsClicked = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (stateShared.isLoggedIn) {
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stateShared.isLoggedIn, githubData.full_name, githubData.owner.login]
  );
  const location = useLocation();
  // TODO: show network data graph visualization
  // https://stackoverflow.com/questions/47792185/d3-how-to-pull-json-from-github-api
  // https://developer.github.com/v3/guides/rendering-data-as-graphs/

  // TODO: show network data graph based on the card that we click and analyse it after storing to database
  // show the network users that we've clicked, and see their connection to other users

  // when isVisible props changes, children will gets re-render
  // so wrap the component that is not subscribed to isVisible by using React Memo
  const isVisibleRef = useRef<HTMLDivElement>(null);
  const isVisible = useViewportSpy(isVisibleRef);
  if (!githubData) return <p>No githubData, sorry</p>;
  return (
    <div
      className={clsx('card bg-light fade-in', {
        'card-width-mobile': columnCount === 1,
      })}
      ref={isVisibleRef}
    >
      {createRenderElement(UserCard, { data: userCardMemoizedData() })}
      <h3 style={{ textAlign: 'center' }}>
        <strong>{githubData.name.toUpperCase().replace(/[_-]/g, ' ')}</strong>
      </h3>
      {createRenderElement(ImagesCard, { index: index, visible: isVisible || false })}
      <div className="trunctuatedTexts">
        <h4 style={{ textAlign: 'center' }}>{githubData.description}</h4>
      </div>
      {createRenderElement(Stargazers, { data: stargazersMemoizedGithubData() })}
      <div className={'language-github-color'}>
        <ul className={`language ${githubData?.language?.replace(/\+\+|#|\s/, '-')}`}>
          <li className={'language-list'}>
            <h6 style={{ color: 'black', width: 'max-content' }}>{githubData.language}</h6>
          </li>
        </ul>
      </div>
      <If condition={!!githubData.topics}>
        <Then>{createRenderElement(TopicsCard, { data: topicsCardMemoizedData(), getRootProps: getRootProps })}</Then>
      </If>
      <div style={{ textAlign: 'center' }} onClick={handleDetailsClicked}>
        <a href={githubData.html_url}>{githubData.html_url}</a>
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
Card.displayName = 'Card';
export default Card;
