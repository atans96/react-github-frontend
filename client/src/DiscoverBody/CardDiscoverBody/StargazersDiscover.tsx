import React, { useRef, useState } from 'react';
import { StarIcon } from '../../util/icons';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { useApolloFactory } from '../../hooks/useApolloFactory';
import { removeStarredMe, setStarredMe } from '../../services';
import { noop } from '../../util/util';
import { MergedDataProps } from '../../typing/type';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { useClickOutside } from '../../hooks/hooks';
import { useTrackedStateShared } from '../../selectors/stateContextSelector';
import Loadable from 'react-loadable';
import { useStableCallback } from '../../util';
import Empty from '../../Layout/EmptyLayout';
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
  const displayName: string | undefined = (StargazerDiscover as React.ComponentType<any>).displayName;
  const { userStarred } = useApolloFactory(displayName!).query.getUserInfoStarred();
  const addedStarredMe = useApolloFactory(displayName!).mutation.addedStarredMe;
  const removeStarred = useApolloFactory(displayName!).mutation.removeStarred;

  const [starClicked, setStarClicked] = useState(userStarred.getUserInfoStarred.starred.includes(data.id));
  const [clicked, setClicked] = useState(false);
  const [visible, setVisible] = useState(false);
  const modalWidth = useRef('400px');
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const notLoggedInRef = useRef<HTMLDivElement>(null);
  useClickOutside(notLoggedInRef, () => setVisible(false));

  const [stateShared] = useTrackedStateShared();

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
};
StargazerDiscover.displayName = 'StargazerDiscover';
export default StargazerDiscover;
