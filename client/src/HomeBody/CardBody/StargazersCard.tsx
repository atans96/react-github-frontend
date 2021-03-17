import React, { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import LoginGQL from './StargazersCardBody/LoginGQL';
import { NavLink } from 'react-router-dom';
import StargazersInfo from './StargazersCardBody/StargazersInfo';
import { useClickOutside, useEventHandlerComposer } from '../../hooks/hooks';
import { SEARCH_FOR_REPOS } from '../../queries';
import { StarIcon } from '../../util/icons';
import { IState, IStateStargazers } from '../../typing/interface';
import { isEqualObjects } from '../../util';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { removeStarredMe, setStarredMe } from '../../services';
import clsx from 'clsx';
import { useApolloFactory } from '../../hooks/useApolloFactory';

interface GQL {
  GQL_variables: {
    reponame: string;
    owner: string;
  };
  GQL_pagination_variables: {
    reponame: string;
    owner: string;
  };
}

interface StargazersCard {
  stargazerCount: string;
  state: IState;
  GQL_VARIABLES: GQL;
  getRootProps: any;
  dispatch: any;
  dispatchStargazers: any;
  stateStargazers: IStateStargazers;
  githubDataId: number;
  githubDataFullName: string;
}

const StargazersCard = React.memo<StargazersCard>(
  ({
    getRootProps,
    stateStargazers,
    githubDataId,
    githubDataFullName,
    dispatchStargazers,
    state,
    dispatch,
    stargazerCount,
    GQL_VARIABLES,
  }) => {
    const displayName: string | undefined = (StargazersCard as React.ComponentType<any>).displayName;
    const addedStarredMe = useApolloFactory(displayName!).mutation.addedStarredMe;
    const removeStarred = useApolloFactory(displayName!).mutation.removeStarred;
    const { userStarred } = useApolloFactory(displayName!).query.getUserInfoStarred();
    const modalWidth = useRef('400px');
    const [starClicked, setStarClicked] = useState(
      userStarred?.getUserInfoStarred?.starred?.includes(githubDataId) || false
    );
    const [visible, setVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const onClicked = useCallback(() => {
      setVisible(false);
      dispatch({
        type: 'REMOVE_ALL',
      });
      dispatchStargazers({
        type: 'REMOVE_ALL',
      });
    }, [dispatch, dispatchStargazers]);
    const { getRootProps: getRootPropsCard } = useEventHandlerComposer({ onClickCb: onClicked });
    const notLoggedInRef = useRef<HTMLDivElement>(null);
    useClickOutside(notLoggedInRef, () => setVisible(false));
    const handleNotLoggedInClick = (e: React.MouseEvent) => {
      e.preventDefault();
      setVisible(false);
    };
    const returnPortal = useCallback(() => {
      switch (visible) {
        case state.tokenGQL.length > 0 && state.isLoggedIn: {
          return createPortal(
            <div
              style={{
                left: `${cursorPosition.x + 20}px`,
                top: `${cursorPosition.y - 40}px`,
                position: 'absolute',
              }}
            >
              <StargazersInfo
                setVisible={setVisible}
                modalWidth={modalWidth.current}
                stargazers_count={stargazerCount}
                isLoading={isLoading}
                stateStargazers={stateStargazers}
                dispatchStargazers={dispatchStargazers}
                dispatch={dispatch}
                GQL_VARIABLES={GQL_VARIABLES}
                getRootProps={getRootProps}
                getRootPropsCard={getRootPropsCard}
              />
            </div>,
            document.body
          );
        }
        case !state.isLoggedIn: {
          return createPortal(
            <div
              style={{
                left: `${cursorPosition.x + 20}px`,
                top: `${cursorPosition.y - 40}px`,
                border: 'solid',
                background: 'aqua',
                position: 'absolute',
                cursor: 'move',
              }}
              ref={notLoggedInRef}
            >
              <span style={{ marginLeft: '10px', marginRight: '10px' }} onClick={handleNotLoggedInClick}>
                <NavLink to={{ pathname: '/login' }}>Please login to access!</NavLink>
              </span>
            </div>,
            document.body
          );
        }
        case state.tokenGQL.length === 0: {
          return createPortal(
            <div
              style={{
                left: `${cursorPosition.x + 20}px`,
                top: `${cursorPosition.y - 40}px`,
                position: 'absolute',
              }}
              ref={notLoggedInRef}
            >
              <LoginGQL
                setVisible={setVisible}
                dispatch={dispatch}
                style={{ display: 'absolute', width: 'fit-content' }}
              />
            </div>,
            document.body
          );
        }
        default:
          return <></>;
      }
      // isLoading need to be in dependency array, otherwise we can't send isLoading state to StargazersInfo inside
      // returnPortal callback here
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.tokenGQL.length, visible, isLoading, state.isLoggedIn, stateStargazers]);

    const handleClickStargazers = (event: React.MouseEvent<HTMLElement>) => {
      setVisible(true); // spawn modal of StargazersInfo
      dispatchStargazers({
        type: 'REMOVE_ALL',
      });
      if (event.pageX + parseInt(modalWidth.current) > window.innerWidth) {
        setCursorPosition({
          x: window.innerWidth - parseInt(modalWidth.current) - 200,
          y: event.pageY,
        });
      } else {
        setCursorPosition({ x: event.pageX, y: event.pageY });
      }
      setIsLoading(true);
    };

    const handleClickStar = async () => {
      if (state.tokenGQL !== '' && !starClicked) {
        await setStarredMe(githubDataFullName, state.tokenGQL).then(() => {
          if (state.isLoggedIn) {
            addedStarredMe({
              variables: {
                starred: [githubDataId],
              },
            }).then(() => {});
          }
        });
      } else if (state.tokenGQL !== '' && starClicked) {
        await removeStarredMe(githubDataFullName, state.tokenGQL).then(() => {
          if (state.isLoggedIn) {
            removeStarred({
              variables: {
                removeStarred: githubDataId,
              },
            }).then(() => {});
          }
        });
      }
    };
    const [clicked, setClicked] = useState(false);
    return (
      <React.Fragment>
        <div className={`stargazer-card-container`}>
          <div
            className={clsx('star-container', {
              confetti: starClicked && clicked && state.tokenGQL !== '',
            })}
            onClick={(e) => {
              e.preventDefault();
              setClicked(true);
              if (state.tokenGQL === '') {
                handleClickStargazers(e);
              } else {
                setStarClicked(!starClicked);
                handleClickStar().then(() => {});
              }
            }}
          >
            {[...Array(50)].map((_, idx) => {
              return <i key={idx} />;
            })}
            <div style={{ marginLeft: '5px', cursor: 'pointer' }}>
              <If condition={starClicked}>
                <Then>
                  <StarIcon />
                </Then>
              </If>
              <If condition={!starClicked}>
                <Then>
                  <StarBorderIcon />
                </Then>
              </If>
            </div>
            <div style={{ marginRight: '5px', cursor: 'pointer' }}>
              <span style={{ fontSize: '15px' }}>{starClicked ? 'Unstar' : 'Star'}</span>
            </div>
          </div>
          <If condition={document.location.pathname === '/'}>
            <Then>
              <div
                className="star-counts-container"
                {...getRootProps({
                  onClick: handleClickStargazers,
                  params: { query: SEARCH_FOR_REPOS, variables: GQL_VARIABLES.GQL_variables },
                  firstCallback: () => {
                    setIsLoading(false);
                  },
                })}
              >
                <span className={'star-counts-text'}>{stargazerCount}</span>
              </div>
            </Then>
          </If>
          <If condition={document.location.pathname === '/discover'}>
            <Then>
              <div className="star-counts-container">
                <span
                  style={{
                    textAlign: 'center',
                    cursor: 'default',
                    marginLeft: '5px',
                    marginRight: '5px',
                    fontSize: '15px',
                    display: 'inline',
                    color: 'blue',
                  }}
                >
                  {stargazerCount}
                </span>
              </div>
            </Then>
          </If>
        </div>
        {visible && returnPortal()}
      </React.Fragment>
    );
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.stateStargazers, nextProps.stateStargazers) &&
      isEqualObjects(prevProps.GQL_VARIABLES, nextProps.GQL_VARIABLES) &&
      isEqualObjects(prevProps.state, nextProps.state) &&
      isEqualObjects(prevProps.state.tokenGQL, nextProps.state.tokenGQL)
    );
  }
);
StargazersCard.displayName = 'StargazersCard';
export default StargazersCard;
