import React, { useCallback, useRef } from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { MergedDataProps } from '../typing/type';
import VisibilitySensor from '../Layout/VisibilitySensor';
import { IAction, IStateDiscover, IStateShared } from '../typing/interface';
import clsx from 'clsx';
import ImagesCardDiscover from './CardBody/ImagesCardDiscover';
import { useApolloFactory } from '../hooks/useApolloFactory';
import { noop } from '../util/util';
import { ActionDiscover } from '../store/Discover/reducer';
import { ActionShared } from '../store/Shared/reducer';
import UserCardDiscover from './CardBody/UserCardDiscover';
import { ActionStargazers } from '../store/Staargazers/reducer';
import StargazersDiscover from './CardBody/StargazersDiscover';

export interface Card {
  index: number;
  githubData: MergedDataProps;
}

interface CardRef extends Card {
  stateDiscover: { stateDiscover: IStateDiscover; stateShared: IStateShared };
  dispatchDiscover: React.Dispatch<IAction<ActionDiscover>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
  dispatchStargazers: React.Dispatch<IAction<ActionStargazers>>;
  routerProps: RouteComponentProps<Record<string, any>, Record<string, any>, Record<string, any>>;
  columnCount: number;
  imagesMapDataDiscover: Map<number, any>;
  sorted: string;
}

const CardDiscover: React.FC<CardRef> = React.forwardRef(
  (
    {
      routerProps,
      stateDiscover,
      dispatchDiscover,
      dispatchStargazers,
      githubData,
      index,
      dispatchShared,
      columnCount,
      imagesMapDataDiscover,
      sorted,
    },
    ref
  ) => {
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
              <UserCardDiscover
                data={userCardMemoizedData()}
                sorted={sorted}
                routerProps={routerProps}
                dispatchDiscover={dispatchDiscover}
                dispatchShared={dispatchShared}
                dispatchStargazers={dispatchStargazers}
              />
              <h3 style={{ textAlign: 'center' }}>
                <strong>{githubData.name.toUpperCase().replace(/[_-]/g, ' ')}</strong>
              </h3>
              <ImagesCardDiscover
                index={index}
                visible={isVisibleRef.current}
                imagesMapDataDiscover={imagesMapDataDiscover}
              />
              <div className="trunctuatedTexts">
                <h4 style={{ textAlign: 'center' }}>{githubData.description}</h4>
              </div>
              <StargazersDiscover
                data={stargazersMemoizedGithubData()}
                stateDiscover={stateDiscover}
                dispatchShared={dispatchShared}
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
