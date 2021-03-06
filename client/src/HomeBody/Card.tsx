import React, { useCallback, useRef } from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import UserCard from './CardBody/UserCard';
import TopicsCard from './CardBody/TopicsCard';
import Stargazers from './CardBody/Stargazers';
import { MergedDataProps } from '../typing/type';
import VisibilitySensor from '../Layout/LazyLoadLayout';
import { IState } from '../typing/interface';
import './CardStyle.scss';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
import useApolloFactory from '../hooks/useApolloFactory';
import clsx from 'clsx';
import ImagesCard from './CardBody/ImagesCard';

export interface Card {
  index: string;
  githubData: MergedDataProps;
  getRootProps?: any;
}

interface CardRef extends Card {
  state: IState;
  dispatch: any;
  dispatchStargazersUser: any;
  dataMongoMemoize: any;
  routerProps: RouteComponentProps<{}, {}, {}>;
  columnCount: number;
}

const Card: React.FC<CardRef> = React.forwardRef(
  (
    {
      columnCount,
      dataMongoMemoize,
      routerProps,
      state,
      dispatch,
      githubData,
      index,
      getRootProps,
      dispatchStargazersUser,
    },
    ref
  ) => {
    const { mutation } = useApolloFactory();
    // when the autocomplete list are showing, use z-index so that it won't appear in front of the list of autocomplete
    // when autocomplete is hidden, don't use z-index since we want to work with changing the cursor and clickable (z-index -1 can't click it)
    const imagesCardMemoizedData = useCallback(() => {
      return state;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.imagesData]);

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
          mutation
            .clickedAdded({
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
            })
            .then(() => {});
        }
      },
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
            <div className={'card-parent'}>
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
                />
                <h3 style={{ textAlign: 'center' }}>
                  <strong>{githubData.name.toUpperCase().replace(/[_-]/g, ' ')}</strong>
                </h3>
                <ImagesCard index={index} visible={isVisibleRef.current} state={imagesCardMemoizedData()} />
                <div className="trunctuatedTexts">
                  <h4 style={{ textAlign: 'center' }}>{githubData.description}</h4>
                </div>
                <Stargazers
                  dataMongoMemoize={dataMongoMemoize}
                  data={stargazersMemoizedGithubData()}
                  state={stargazersMemoizedData()}
                  dispatch={dispatch}
                  githubDataFullName={githubData.full_name}
                  githubDataId={githubData.id}
                />
                <ul
                  className={`language ${githubData?.language?.replace(/\+\+|#|\s/, '-')}`}
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
                      state: { data: githubData, path: window.location.pathname },
                    }}
                    className="btn-clear nav-link"
                  >
                    <p>MORE DETAILS</p>
                  </NavLink>
                </div>
              </div>
            </div>
          );
        }}
      </VisibilitySensor>
    );
  }
);
export default Card;
