import React, { useRef, useState } from 'react';
import { StarIcon } from '../../../util/icons';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { If } from '../../../util/react-if/If';
import { Then } from '../../../util/react-if/Then';
import { removeStarredMe, setStarredMe } from '../../../services';
import { noop } from '../../../util/util';
import { MergedDataProps } from '../../../typing/type';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { useClickOutside } from '../../../hooks/hooks';
import { useTrackedStateShared } from '../../../selectors/stateContextSelector';
import Loadable from 'react-loadable';
import { useStableCallback } from '../../../util';
import Empty from '../../Layout/EmptyLayout';
import { parallel } from 'async';
import { useGetUserInfoStarredMutation } from '../../../apolloFactory/useGetUserInfoStarredMutation';

const LoginGQL = Loadable({
  loading: Empty,
  delay: 300,
  loader: () =>
    import(/* webpackChunkName: "LoginGQLDiscover" */ '../../HomeBody/CardBody/StargazersCardBody/LoginGQL'),
});

interface StargazerDiscover {
  data: MergedDataProps;
}
const StargazerDiscover: React.FC<StargazerDiscover> = ({ data }) => {
  const { addedStarredMe, removeStarred } = useGetUserInfoStarredMutation();
  const [stateShared] = useTrackedStateShared();
  const [starClicked, setStarClicked] = useState(stateShared.starred.includes(data.id));
  const [clicked, setClicked] = useState(false);
  const [visible, setVisible] = useState(false);
  const modalWidth = useRef('400px');

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const notLoggedInRef = useRef<HTMLDivElement>(null);

  useClickOutside(notLoggedInRef, () => setVisible(false));

  const returnPortal = useStableCallback(() => {
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
    if (event.pageX + parseInt(modalWidth.current) > window.innerWidth) {
      setCursorPosition({
        x: window.innerWidth - parseInt(modalWidth.current) - 200,
        y: event.pageY,
      });
    } else {
      setCursorPosition({ x: event.pageX, y: event.pageY });
    }
  };
  const handleClickStar = () => {
    if (!starClicked) {
      parallel([
        () => setStarredMe(data.full_name),
        () => {
          if (stateShared.isLoggedIn) {
            addedStarredMe({
              getUserInfoStarred: {
                starred: [data.id],
              },
            }).then(noop);
          }
        },
      ]);
    } else if (starClicked) {
      parallel([
        () => removeStarredMe(data.full_name),
        () => {
          if (stateShared.isLoggedIn) {
            removeStarred({
              removeStarred: data.id,
            }).then(noop);
          }
        },
      ]);
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
          e.stopPropagation();
          e.stopPropagation();
          setClicked(true);
          if (stateShared.tokenGQL === '') {
            handleClickStargazers(e);
          } else {
            setStarClicked(!starClicked);
            handleClickStar();
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
};
StargazerDiscover.displayName = 'StargazerDiscover';
export default StargazerDiscover;
