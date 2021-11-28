import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import UserCard from './CardBody/UserCard';
import TopicsCard from './CardBody/TopicsCard';
import CardTitle from './CardBody/CardTitle';
import { MergedDataProps } from '../../typing/type';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import clsx from 'clsx';
import { noop } from '../../util/util';
import { useTrackedState, useTrackedStateShared } from '../../selectors/stateContextSelector';
import GitHubIcon from '@material-ui/icons/GitHub';
import Loadable from 'react-loadable';
import { useStableCallback } from '../../util';
import './Card.scss';
import Empty from '../Layout/EmptyLayout';
import { useGetClickedMutation } from '../../apolloFactory/useGetClickedMutation';
import Stargazers from './CardBody/Stargazers';
import { gsap } from 'gsap';

export interface CardProps {
  data: MergedDataProps;
  index: number;
  getRootProps?: any;
}
// const tl = gsap.timeline();

const ImagesCard = Loadable({
  loading: Empty,
  loader: () => import(/* webpackChunkName: "ImagesCard" */ './CardBody/ImagesCard'),
});

const Card: React.FC<CardProps> = ({ data, getRootProps, index }) => {
  // when the autocomplete list are showing, use z-index so that it won't appear in front of the list of autocomplete
  // when autocomplete is hidden, don't use z-index since we want to work with changing the cursor and clickable (z-index -1 can't click it)
  const [stateShared] = useTrackedStateShared();
  let el = useRef(null);
  const [state] = useTrackedState();
  const clickedAdded = useGetClickedMutation();
  const [isHover, setIsHover] = React.useState(false);

  const userCardMemoizedData = useStableCallback(() => {
    return { owner: data.owner, id: data.id };
  });

  const cardTitleMemoize = useStableCallback(() => {
    return { name: data.name, id: data.id };
  });

  useEffect(() => {
    // random fade-in each card
    gsap.from(el.current, 1, {
      x: 0,
      opacity: 0,
      delay: Math.random(),
    });
  }, [el]);

  const topicsCardMemoizedData = useStableCallback(() => data.topics);

  const stargazersMemoizedGithubData = useStableCallback(() => data);
  const mouseDownHandler = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
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
              count: 1,
              dateClicked: new Date(),
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
    e.stopPropagation();
    if (stateShared.isLoggedIn) {
      const temp = [
        Object.assign(
          {},
          {
            full_name: data.full_name,
            count: 1,
            dateClicked: new Date(),
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
      ref={el}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className={clsx('card bg-light')}
      style={{
        width: stateShared.width < 760 ? stateShared.width : '',
        maxWidth: stateShared.width < 760 ? stateShared.width : '',
      }}
    >
      <If condition={isHover}>
        <Then>
          <span className={'glow'} />
          <span className={'glow'} />
          <span className={'glow'} />
          <span className={'glow'} />
        </Then>
      </If>
      <UserCard data={userCardMemoizedData()} />
      <CardTitle data={cardTitleMemoize()} />
      {state.imagesData.length > 0 && <ImagesCard index={index} />}
      <div className="trunctuatedTexts">
        <h4 style={{ textAlign: 'center' }}>{data.description}</h4>
      </div>
      <Stargazers data={stargazersMemoizedGithubData()} />
      <If condition={stateShared.githubLanguages.has(data.language)}>
        <Then>
          <ul className={'language'} style={{ color: stateShared.githubLanguages.get(data?.language)?.obj.color }}>
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
        <a href={data.html_url} onClick={() => window.open(data.html_url)} target="_blank">
          <GitHubIcon />
        </a>
      </div>
      <div className="details" onClick={handleDetailsClicked} onMouseDown={mouseDownHandler}>
        <NavLink
          to={{
            pathname: `/detail/${data.id}`,
            state: JSON.stringify({ data: data, path: '/' }),
          }}
          className="shine-container btn-clear nav-link"
        >
          <p>MORE DETAILS</p>
          <i className={'shine'} />
        </NavLink>
      </div>
    </div>
  );
};
Card.displayName = 'Card';
export default Card;
