import React, { useCallback, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import UserCard from './CardBody/UserCard';
import TopicsCard from './CardBody/TopicsCard';
import CardTitle from './CardBody/CardTitle';
import Stargazers from './CardBody/Stargazers';
import { MergedDataProps } from '../typing/type';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
import clsx from 'clsx';
import ImagesCard from './CardBody/ImagesCard';
import { useApolloFactory } from '../hooks/useApolloFactory';
import { noop } from '../util/util';
import { useTrackedStateShared } from '../selectors/stateContextSelector';
import { createRenderElement } from '../Layout/MasonryLayout';
import GitHubIcon from '@material-ui/icons/GitHub';

export interface CardProps {
  data: MergedDataProps;
  columnCount: number;
  index: number;
  getRootProps?: any;
}
const Card: React.FC<CardProps> = ({ data, getRootProps, columnCount, index }) => {
  // when the autocomplete list are showing, use z-index so that it won't appear in front of the list of autocomplete
  // when autocomplete is hidden, don't use z-index since we want to work with changing the cursor and clickable (z-index -1 can't click it)
  const [stateShared] = useTrackedStateShared();
  const displayName: string | undefined = (Card as React.ComponentType<any>).displayName;
  const clickedAdded = useApolloFactory(displayName!).mutation.clickedAdded;

  const userCardMemoizedData = useCallback(() => {
    return { owner: data.owner, id: data.id };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.owner, data.id]);

  const cardTitleMemoize = useCallback(() => {
    return { name: data.name, id: data.id };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.name, data.id]);

  const topicsCardMemoizedData = useCallback(() => {
    return data.topics;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.topics]);

  const stargazersMemoizedGithubData = useCallback(() => {
    return data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.name, data.owner.login, data.full_name, data.id]);

  const mouseDownHandler = (event: React.MouseEvent) => {
    event.preventDefault();
    if (event.button === 1) {
      localStorage.setItem('detailsData', JSON.stringify({ data: data, path: '/' }));
      // history.push(`/detail/${data.id}`);
      window.open(`/detail/${data.id}`);
      if (stateShared.isLoggedIn) {
        const temp = [
          Object.assign(
            {},
            {
              full_name: data.full_name,
              owner: {
                login: data.owner.login,
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
    }
  };
  const handleDetailsClicked = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (stateShared.isLoggedIn) {
        const temp = [
          Object.assign(
            {},
            {
              full_name: data.full_name,
              owner: {
                login: data.owner.login,
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stateShared.isLoggedIn, data.full_name, data.owner.login]
  );
  // TODO: show network data graph visualization
  // https://stackoverflow.com/questions/47792185/d3-how-to-pull-json-from-github-api
  // https://developer.github.com/v3/guides/rendering-data-as-graphs/

  // TODO: show network data graph based on the card that we click and analyse it after storing to database
  // show the network users that we've clicked, and see their connection to other users

  // when isVisible props changes, children will gets re-render
  // so wrap the component that is not subscribed to isVisible by using React Memo
  // const isVisibleRef = useRef<HTMLDivElement>(null);
  // const isVisible = useViewportSpy(isVisibleRef);
  if (!data) return <p>No data, sorry</p>;
  return (
    <div
      className={clsx('card bg-light fade-in', {
        'card-width-mobile': columnCount === 1,
      })}
    >
      {createRenderElement(UserCard, { data: userCardMemoizedData() })}
      {createRenderElement(CardTitle, { data: cardTitleMemoize() })}
      {createRenderElement(ImagesCard, { index: index })}
      <div className="trunctuatedTexts">
        <h4 style={{ textAlign: 'center' }}>{data.description}</h4>
      </div>
      {createRenderElement(Stargazers, { data: stargazersMemoizedGithubData() })}
      <div>
        <ul style={{ color: stateShared.githubLanguages.get(data?.language?.replace(/\+\+|#|\s/, '-'))?.color }}>
          <li className={'language-list'}>
            <h6 style={{ color: 'black', width: 'max-content' }}>{data.language}</h6>
          </li>
        </ul>
      </div>
      <If condition={!!data.topics}>
        <Then>{createRenderElement(TopicsCard, { data: topicsCardMemoizedData(), getRootProps: getRootProps })}</Then>
      </If>
      <div style={{ textAlign: 'center', overflowWrap: 'anywhere' }} onClick={handleDetailsClicked}>
        <a href={data.html_url} target="_blank" rel="noopener noreferrer">
          <GitHubIcon />
        </a>
      </div>
      <div className="details" onClick={handleDetailsClicked} onMouseDown={mouseDownHandler}>
        <NavLink
          to={{
            pathname: `/detail/${data.id}`,
            state: JSON.stringify({ data: data, path: '/' }),
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
