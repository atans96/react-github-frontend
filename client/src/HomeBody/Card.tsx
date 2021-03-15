import React, { useCallback, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import UserCard from './CardBody/UserCard';
import TopicsCard from './CardBody/TopicsCard';
import Stargazers from './CardBody/Stargazers';
import { MergedDataProps } from '../typing/type';
import VisibilitySensor from '../Layout/VisibilitySensor';
import { IState, IStateStargazers } from '../typing/interface';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
import clsx from 'clsx';
import ImagesCard from './CardBody/ImagesCard';
import { useApolloFactory } from '../hooks/useApolloFactory';

export interface Card {
  index: number;
  githubData: MergedDataProps;
  getRootProps?: any;
}

interface CardRef extends Card {
  state: IState;
  stateStargazersMemoize: IStateStargazers;
  dispatch: any;
  dispatchStargazersUser: any;
  dataMongoMemoize: any;
  columnCount: number;
}

const Card: React.FC<CardRef> = React.forwardRef(
  (
    {
      columnCount,
      dataMongoMemoize,
      state,
      dispatch,
      githubData,
      index,
      stateStargazersMemoize,
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
      return githubData;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [githubData.owner]);

    const topicsCardMemoizedData = useCallback(() => {
      return githubData.topics;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [githubData.topics]);

    const stargazersMemoizedData = useCallback(() => {
      return state;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.isLoggedIn, state.isLoading, state.tokenGQL]);

    const stargazersMemoizedGithubData = useCallback(() => {
      return githubData;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [githubData.name, githubData.owner.login]);

    const handleDetailsClicked = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        if (state.isLoggedIn) {
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
          }).then((e) => {
            console.log(e);
          });
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [state.isLoggedIn, githubData.full_name, githubData.owner.login]
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
              <UserCard data={userCardMemoizedData()} dispatch={dispatch} dispatchStargazers={dispatchStargazersUser} />
              <h3 style={{ textAlign: 'center' }}>
                <strong>{githubData.name.toUpperCase().replace(/[_-]/g, ' ')}</strong>
              </h3>
              <ImagesCard index={index} visible={isVisibleRef.current} state={state} />
              <div className="trunctuatedTexts">
                <h4 style={{ textAlign: 'center' }}>{githubData.description}</h4>
              </div>
              <Stargazers
                dataMongoMemoize={dataMongoMemoize}
                data={stargazersMemoizedGithubData()}
                state={stargazersMemoizedData()}
                stateStargazers={stateStargazersMemoize}
                dispatch={dispatch}
                dispatchStargazersUser={dispatchStargazersUser}
                githubDataFullName={githubData.full_name}
                githubDataId={githubData.id}
              />
              <ul
                className={`language-github-color language ${githubData?.language?.replace(/\+\+|#|\s/, '-')}`}
                style={{ backgroundColor: 'transparent' }}
              >
                <li className={'language-list'}>
                  <h6 style={{ color: 'black' }}>{githubData.language}</h6>
                </li>
              </ul>
              <If condition={!!githubData.topics}>
                <Then>
                  <TopicsCard
                    data={topicsCardMemoizedData()}
                    state={stargazersMemoizedData()}
                    perPage={state.perPage}
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
