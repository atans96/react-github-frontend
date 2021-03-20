import React, { useCallback, useRef } from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import UserCard from './CardBody/UserCard';
import Stargazers from './CardBody/Stargazers';
import { MergedDataProps } from '../typing/type';
import VisibilitySensor from '../Layout/VisibilitySensor';
import { IState, IStateStargazers } from '../typing/interface';
import clsx from 'clsx';
import ImagesCardDiscover from './CardBody/ImagesCardDiscover';
import { useApolloFactory } from '../hooks/useApolloFactory';

export interface Card {
  index: number;
  githubData: MergedDataProps;
}

interface CardRef extends Card {
  state: IState;
  stateStargazersMemoize: IStateStargazers;
  dispatch: any;
  dispatchStargazersUser: any;
  routerProps: RouteComponentProps<Record<string, any>, Record<string, any>, Record<string, any>>;
  columnCount: number;
  imagesMapDataDiscover: Map<number, any>;
}

const CardDiscover: React.FC<CardRef> = React.forwardRef(
  (
    {
      routerProps,
      state,
      dispatch,
      githubData,
      index,
      dispatchStargazersUser,
      columnCount,
      stateStargazersMemoize,
      imagesMapDataDiscover,
    },
    ref
  ) => {
    // when the autocomplete list are showing, use z-index so that it won't appear in front of the list of autocomplete
    // when autocomplete is hidden, don't use z-index since we want to work with changing the cursor and clickable (z-index -1 can't click it)

    const userCardMemoizedData = useCallback(() => {
      return githubData;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [githubData.owner]);

    const routerPropsMemoizedData = useCallback(() => {
      return routerProps;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routerProps]);

    const stargazersMemoizedData = useCallback(() => {
      return state;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.isLoggedIn, state.isLoading, state.tokenGQL]);

    const stargazersMemoizedGithubData = useCallback(() => {
      return githubData;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [githubData.name, githubData.owner.login]);
    const displayName: string | undefined = (CardDiscover as React.ComponentType<any>).displayName;
    const clickedAdded = useApolloFactory(displayName!).mutation.clickedAdded;
    const handleDetailsClicked = (e: React.MouseEvent) => {
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
    };
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
                routerProps={routerPropsMemoizedData()}
              />
              <h3 style={{ textAlign: 'center' }}>
                <strong>{githubData.name.toUpperCase().replace(/[_-]/g, ' ')}</strong>
              </h3>
              <ImagesCardDiscover
                index={index}
                visible={isVisibleRef.current}
                state={state}
                imagesMapDataDiscover={imagesMapDataDiscover}
              />
              <div className="trunctuatedTexts">
                <h4 style={{ textAlign: 'center' }}>{githubData.description}</h4>
              </div>
              <Stargazers
                data={stargazersMemoizedGithubData()}
                state={stargazersMemoizedData()}
                stateStargazers={stateStargazersMemoize}
                dispatch={dispatch}
                dispatchStargazersUser={dispatchStargazersUser}
                githubDataFullName={githubData.full_name}
                githubDataId={githubData.id}
              />
              <div className={'language-github-color'}>
                <ul
                  className={`language ${githubData?.language?.replace(/\+\+|#|\s/, '-')}`}
                  style={{ backgroundColor: 'transparent' }}
                >
                  <li className={'language-list'}>
                    <h6 style={{ color: 'black' }}>{githubData.language}</h6>
                  </li>
                </ul>
              </div>
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
CardDiscover.displayName = 'CardDiscover';
export default CardDiscover;
