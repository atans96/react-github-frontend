import React from 'react';
import { NavLink } from 'react-router-dom';
import UserCard from './CardBody/UserCard';
import TopicsCard from './CardBody/TopicsCard';
import CardTitle from './CardBody/CardTitle';
import { MergedDataProps } from '../typing/type';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
import clsx from 'clsx';
import { useApolloFactory } from '../hooks/useApolloFactory';
import { noop } from '../util/util';
import { useTrackedState, useTrackedStateShared } from '../selectors/stateContextSelector';
import GitHubIcon from '@material-ui/icons/GitHub';
import Loadable from 'react-loadable';
import { useStableCallback } from '../util';
import './Card.scss';
import Empty from '../Layout/EmptyLayout';

export interface CardProps {
  data: MergedDataProps;
  columnCount: number;
  index: number;
  getRootProps?: any;
}
const ImagesCard = Loadable({
  loading: Empty,
  loader: () => import(/* webpackChunkName: "ImagesCard" */ './CardBody/ImagesCard'),
});
const Stargazers = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "Stargazers" */ './CardBody/Stargazers'),
});
const Card: React.FC<CardProps> = ({ data, getRootProps, columnCount, index }) => {
  // when the autocomplete list are showing, use z-index so that it won't appear in front of the list of autocomplete
  // when autocomplete is hidden, don't use z-index since we want to work with changing the cursor and clickable (z-index -1 can't click it)
  const [stateShared] = useTrackedStateShared();
  const [state] = useTrackedState();
  const displayName: string = (Card as React.ComponentType<any>).displayName || '';
  const clickedAdded = useApolloFactory(displayName!).mutation.clickedAdded;

  const userCardMemoizedData = useStableCallback(() => {
    return { owner: data.owner, id: data.id };
  });

  const cardTitleMemoize = useStableCallback(() => {
    return { name: data.name, id: data.id };
  });

  const topicsCardMemoizedData = useStableCallback(() => data.topics);

  const stargazersMemoizedGithubData = useStableCallback(() => data);

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
  const handleDetailsClicked = useStableCallback((e: React.MouseEvent) => {
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
  });
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
      <UserCard data={userCardMemoizedData()} />
      <CardTitle data={cardTitleMemoize()} />
      {state.imagesData.length > 0 && <ImagesCard index={index} />}
      <div className="trunctuatedTexts">
        <h4 style={{ textAlign: 'center' }}>{data.description}</h4>
      </div>
      <Stargazers data={stargazersMemoizedGithubData()} />
      <If condition={data.language !== null}>
        <Then>
          <ul className={'language'} style={{ color: stateShared.githubLanguages.get(data?.language)?.color }}>
            <li className={'language-list'}>
              <h6 style={{ color: 'black', width: 'max-content' }}>{data.language}</h6>
            </li>
          </ul>
        </Then>
      </If>
      <If condition={!!data.topics}>
        <Then>
          <TopicsCard data={topicsCardMemoizedData()} getRootProps={getRootProps} />
        </Then>
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
