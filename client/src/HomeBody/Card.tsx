import React, { useCallback, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import UserCard from './CardBody/UserCard';
import TopicsCard from './CardBody/TopicsCard';
import Stargazers from './CardBody/Stargazers';
import { MergedDataProps } from '../typing/type';
import VisibilitySensor from '../Layout/VisibilitySensor';
import { IAction, IState, IStateShared, IStateStargazers } from '../typing/interface';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
import clsx from 'clsx';
import ImagesCard from './CardBody/ImagesCard';
import { useApolloFactory } from '../hooks/useApolloFactory';
import { noop } from '../util/util';
import { Action } from '../store/Home/reducer';
import { ActionStargazers } from '../store/Staargazers/reducer';
import { ActionShared } from '../store/Shared/reducer';

export interface Card {
  index: number;
  githubData: MergedDataProps;
  getRootProps?: any;
}

interface CardRef extends Card {
  state: IState;
  stateStargazers: IStateStargazers;
  stateShared: IStateShared;
  dispatch: React.Dispatch<IAction<Action>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
  dispatchStargazersUser: React.Dispatch<IAction<ActionStargazers>>;
  columnCount: number;
}

const Card: React.FC<CardRef> = React.forwardRef(
  (
    {
      columnCount,
      state,
      dispatch,
      dispatchShared,
      githubData,
      index,
      stateShared,
      stateStargazers,
      getRootProps,
      dispatchStargazersUser,
    },
    ref
  ) => {
    // when the autocomplete list are showing, use z-index so that it won't appear in front of the list of autocomplete
    // when autocomplete is hidden, don't use z-index since we want to work with changing the cursor and clickable (z-index -1 can't click it)
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

    const stateTopicsCardMemoizedData = useCallback(() => {
      return stateShared;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateShared.tokenGQL, stateShared.perPage]);

    const stargazersMemoizedData = useCallback(() => {
      return { state, stateStargazers, stateShared };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, stateStargazers, stateShared]);

    const stargazersMemoizedGithubData = useCallback(() => {
      return githubData;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [githubData.name, githubData.owner.login]);

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
    // TODO: show network data graph visualization
    // https://stackoverflow.com/questions/47792185/d3-how-to-pull-json-from-github-api
    // https://developer.github.com/v3/guides/rendering-data-as-graphs/

    // TODO: show network data graph based on the card that we click and analyse it after storing to database
    // show the network users that we've clicked, and see their connection to other users

    // when isVisible props changes, children will gets re-render
    // so wrap the component that is not subscribed to isVisible by using React Memo
    const isVisibleRef = useRef(false);
    if (!githubData) return <p>No githubData, sorry</p>;
    return (
      <VisibilitySensor>
        {({ isVisible }: any) => {
          if (!isVisibleRef.current && isVisible) {
            isVisibleRef.current = isVisible;
          }
          return (
            <div
              className={clsx('card bg-light fade-in', {
                'card-width-mobile': columnCount === 1,
              })}
              style={!isVisibleRef.current ? { contentVisibility: 'auto' } : {}}
            >
              <UserCard
                data={userCardMemoizedData()}
                dispatch={dispatch}
                dispatchStargazers={dispatchStargazersUser}
                dispatchShared={dispatchShared}
              />
              <h3 style={{ textAlign: 'center' }}>
                <strong>{githubData.name.toUpperCase().replace(/[_-]/g, ' ')}</strong>
              </h3>
              <ImagesCard index={index} visible={isVisibleRef.current} state={state} />
              <div className="trunctuatedTexts">
                <h4 style={{ textAlign: 'center' }}>{githubData.description}</h4>
              </div>
              <Stargazers
                data={stargazersMemoizedGithubData()}
                stateStargazers={stargazersMemoizedData()}
                dispatch={dispatch}
                dispatchStargazersUser={dispatchStargazersUser}
                dispatchShared={dispatchShared}
                githubDataFullName={githubData.full_name}
                githubDataId={githubData.id}
              />
              <div className={'language-github-color'}>
                <ul className={`language ${githubData?.language?.replace(/\+\+|#|\s/, '-')}`}>
                  <li className={'language-list'}>
                    <h6 style={{ color: 'black' }}>{githubData.language}</h6>
                  </li>
                </ul>
              </div>
              <If condition={!!githubData.topics}>
                <Then>
                  <TopicsCard
                    data={topicsCardMemoizedData()}
                    state={stateTopicsCardMemoizedData()}
                    getRootProps={getRootProps}
                  />
                </Then>
              </If>
              <div style={{ textAlign: 'center' }} onClick={handleDetailsClicked}>
                <a href={githubData.html_url}>{githubData.html_url}</a>
              </div>
              <div className="details" onClick={handleDetailsClicked}>
                <NavLink
                  to={{
                    pathname: `/detail/${githubData.id}`,
                    state: { data: githubData, path: document.location.pathname },
                  }}
                  className="btn-clear nav-link"
                >
                  <p>MORE DETAILS</p>
                </NavLink>
              </div>
            </div>
          );
        }}
      </VisibilitySensor>
    );
  }
);
Card.displayName = 'Card';
export default Card;
