import React, { useCallback, useRef, useState } from 'react';
import { StarIcon } from '../../util/icons';
import { isEqualObjects } from '../../util';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { useApolloFactory } from '../../hooks/useApolloFactory';
import { removeStarredMe, setStarredMe } from '../../services';
import { noop } from '../../util/util';
import { MergedDataProps } from '../../typing/type';
import { createPortal } from 'react-dom';
import LoginGQL from '../../HomeBody/CardBody/StargazersCardBody/LoginGQL';
import clsx from 'clsx';
import { useClickOutside } from '../../hooks/hooks';
import { useTrackedStateShared } from '../../selectors/stateContextSelector';
import idx from 'idx';
import { createRenderElement } from '../../Layout/MasonryLayout';

interface StargazerDiscover {
  data: MergedDataProps;
}

const StargazerDiscover = React.memo<StargazerDiscover>(
  ({ data }) => {
    const displayName: string | undefined = (StargazerDiscover as React.ComponentType<any>).displayName;
    const { userStarred } = useApolloFactory(displayName!).query.getUserInfoStarred();
    const addedStarredMe = useApolloFactory(displayName!).mutation.addedStarredMe;
    const removeStarred = useApolloFactory(displayName!).mutation.removeStarred;

    const [starClicked, setStarClicked] = useState(
      idx(userStarred, (_) => _.getUserInfoStarred.starred.includes(data.id)) ?? false
    );
    const [clicked, setClicked] = useState(false);
    const [visible, setVisible] = useState(false);
    const modalWidth = useRef('400px');
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [isLoading, setIsLoading] = useState(false);

    const notLoggedInRef = useRef<HTMLDivElement>(null);
    useClickOutside(notLoggedInRef, () => setVisible(false));

    const [stateShared] = useTrackedStateShared();

    const returnPortal = useCallback(() => {
      switch (visible) {
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
              {createRenderElement(LoginGQL, {
                setVisible,
                style: { display: 'absolute', width: 'fit-content' },
              })}
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
    }, [stateShared.tokenGQL.length, visible, isLoading, stateShared.isLoggedIn]);

    const handleClickStargazers = (event: React.MouseEvent<HTMLElement>) => {
      setVisible(true); // spawn modal of StargazersInfo
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
      if (stateShared.tokenGQL !== '' && !starClicked) {
        await setStarredMe(data.full_name, stateShared.tokenGQL).then(() => {
          if (stateShared.isLoggedIn) {
            addedStarredMe({
              getUserInfoStarred: {
                starred: [data.id],
              },
            }).then(noop);
          }
        });
      } else if (stateShared.tokenGQL !== '' && starClicked) {
        await removeStarredMe(data.full_name, stateShared.tokenGQL).then(() => {
          if (stateShared.isLoggedIn) {
            removeStarred({
              removeStarred: data.id,
            }).then(noop);
          }
        });
      }
    };
    return (
      <div className={`stargazer-card-container`}>
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
            {data.stargazers_count}
          </span>
        </div>
        {visible && returnPortal()}
      </div>
    );
  },
  (prevProps: any, nextProps: any) => {
    return isEqualObjects(prevProps.data, nextProps.data);
  }
);
StargazerDiscover.displayName = 'StargazerDiscover';
export default StargazerDiscover;
