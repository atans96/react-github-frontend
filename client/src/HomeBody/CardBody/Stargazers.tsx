import React, { useRef, useState } from 'react';
import { MergedDataProps } from '../../typing/type';
import { useApolloClient } from '@apollo/client';
import { useClickOutside, useEventHandlerComposer } from '../../hooks/hooks';

import {
  useTrackedState,
  useTrackedStateShared,
  useTrackedStateStargazers,
} from '../../selectors/stateContextSelector';
import clsx from 'clsx';
import { noop } from '../../util/util';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { StarIcon } from '../../util/icons';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { SEARCH_FOR_REPOS } from '../../graphql/queries';
import { useApolloFactory } from '../../hooks/useApolloFactory';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { removeStarredMe, setStarredMe } from '../../services';
import Loadable from 'react-loadable';
import { useStableCallback } from '../../util';
import Empty from '../../Layout/EmptyLayout';
const StargazersInfo = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "StargazersInfo" */ './StargazersCardBody/StargazersInfo'),
});

const LoginGQL = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "LoginGQL" */ './StargazersCardBody/LoginGQL'),
});
interface StargazersProps {
  data: MergedDataProps;
}

const Stargazers: React.FC<StargazersProps> = ({ data }) => {
  const client = useApolloClient();
  const [stateStargazers, dispatchStargazers] = useTrackedStateStargazers();
  const [stateShared] = useTrackedStateShared();
  const [, dispatch] = useTrackedState();
  const GQL_variables = {
    reponame: data.name,
    owner: data.owner.login,
    stargazersCount: stateStargazers.stargazersUsers,
    starredRepoCount: stateStargazers.stargazersUsersStarredRepositories,
  };

  const GQL_pagination_variables = {
    reponame: data.name,
    owner: data.owner.login,
    stargazersCount: stateStargazers.stargazersUsers, // localStorage.getItem("users) cannot be updated to stargazersCount
    // when localStorage changes as a result of FilterResult of localStorage.setItem()
    // but to update this stargazersCount variable, StargazersCard component need to re-render
    // but there is no way to re-render StargazersCard as a result of FilterResult changes other than
    // clicks event in StargazersCard.js. Thus, you need to use React.context to sync with FilterResult.js
    starredRepoCount: stateStargazers.stargazersUsersStarredRepositories,
    after: stateStargazers.hasNextPage.endCursor,
  };
  const onClickCb = useStableCallback(async ({ query, variables }: any) => {
    if (stateShared.tokenGQL !== '') {
      return await client // return Promise
        .query({
          query: query,
          variables: variables,
          context: { clientName: 'github' },
        })
        .then((result) => {
          result.data.repository.stargazers.nodes.map((node: any) => {
            const newNode = { ...node };
            newNode['isQueue'] = false;
            return dispatchStargazers({
              type: 'STARGAZERS_ADDED',
              payload: {
                stargazersData: newNode,
              },
            });
          });
          dispatchStargazers({
            type: 'STARGAZERS_HAS_NEXT_PAGE',
            payload: {
              hasNextPage: result.data.repository.stargazers.pageInfo || {},
            },
          });
        });
    }
  });
  const { getRootProps } = useEventHandlerComposer({ onClickCb: onClickCb });
  const displayName: string | undefined = (Stargazers as React.ComponentType<any>).displayName;
  const addedStarredMe = useApolloFactory(displayName!).mutation.addedStarredMe;
  const removeStarred = useApolloFactory(displayName!).mutation.removeStarred;
  const { userStarred } = useApolloFactory(displayName!).query.getUserInfoStarred();
  const modalWidth = useRef('400px');
  const [starClicked, setStarClicked] = useState(userStarred.getUserInfoStarred.starred.includes(data.id));

  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const starCountsContainerRef = useRef<HTMLDivElement>(null);

  const onClicked = useStableCallback(() => {
    setVisible(false);
    dispatch({
      type: 'REMOVE_ALL',
    });
    dispatchStargazers({
      type: 'REMOVE_ALL',
    });
  });

  const { getRootProps: getRootPropsCard } = useEventHandlerComposer({ onClickCb: onClicked });
  const notLoggedInRef = useRef<HTMLDivElement>(null);
  useClickOutside(notLoggedInRef, () => setVisible(false));
  const handleNotLoggedInClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setVisible(false);
  };
  const returnPortal = useStableCallback(() => {
    switch (visible) {
      case stateShared.tokenGQL.length > 0 && stateShared.isLoggedIn: {
        return createPortal(
          <div
            style={{
              left: `${cursorPosition.x + 20}px`,
              top: `${cursorPosition.y - 40}px`,
              position: 'absolute',
            }}
          >
            {visible && stateShared.tokenGQL.length > 0 && stateShared.isLoggedIn && (
              <StargazersInfo
                setVisible={setVisible}
                getRootProps={getRootProps}
                getRootPropsCard={getRootPropsCard}
                modalWidth={modalWidth.current}
                stargazers_count={data.stargazers_count}
                isLoading={isLoading}
                GQL_VARIABLES={{ GQL_variables, GQL_pagination_variables }}
              />
            )}
          </div>,
          document.body
        );
      }
      case !stateShared.isLoggedIn: {
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
      case stateShared.tokenGQL.length === 0: {
        return createPortal(
          <div
            style={{
              left: `${cursorPosition.x + 20}px`,
              top: `${cursorPosition.y - 40}px`,
              position: 'absolute',
            }}
            ref={notLoggedInRef}
          >
            {visible && stateShared.tokenGQL.length === 0 && (
              <LoginGQL setVisible={setVisible} style={{ display: 'absolute', width: 'fit-content' }} />
            )}
          </div>,
          document.body
        );
      }
      default:
        return <></>;
    }
  });

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
    if (!starClicked) {
      await setStarredMe(data.full_name).then(() => {
        if (stateShared.isLoggedIn) {
          addedStarredMe({
            getUserInfoStarred: {
              starred: [data.id],
            },
          }).then(noop);
        }
      });
    } else if (starClicked) {
      await removeStarredMe(data.full_name).then(() => {
        if (stateShared.isLoggedIn) {
          removeStarred({
            removeStarred: data.id,
          }).then(noop);
        }
      });
    }
  };
  const [clicked, setClicked] = useState(false);

  return (
    <React.Fragment>
      <div className={`stargazer-card-container`} ref={starCountsContainerRef}>
        <div
          className={clsx('star-container', {
            confetti: starClicked && clicked && stateShared.tokenGQL !== '',
          })}
          onClick={(e) => {
            e.preventDefault();
            setClicked(true);
            if (stateShared.tokenGQL === '') {
              handleClickStargazers(e);
            } else {
              setStarClicked(!starClicked);
              handleClickStar().then(noop);
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

        <div
          className="star-counts-container"
          {...getRootProps({
            onClick: handleClickStargazers,
            params: { query: SEARCH_FOR_REPOS, variables: { ...GQL_variables } },
            firstCallback: () => {
              setIsLoading(false);
            },
          })}
        >
          <span className={'star-counts-text'}>{data.stargazers_count}</span>
        </div>
      </div>
      {visible && returnPortal()}
    </React.Fragment>
  );
};

Stargazers.displayName = 'Stargazers';
export default Stargazers;
