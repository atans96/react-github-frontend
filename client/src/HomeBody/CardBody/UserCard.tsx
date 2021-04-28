import React from 'react';
import { useUserCardStyles } from '../../DiscoverBody/CardDiscoverBody/UserCardStyle';
import { CardEnhancement, OwnerProps } from '../../typing/type';
import {
  useTrackedState,
  useTrackedStateShared,
  useTrackedStateStargazers,
} from '../../selectors/stateContextSelector';

interface UserCard {
  data: { owner: OwnerProps; id: number; cardEnhancement: Map<number, CardEnhancement> };
}

const UserCard: React.FC<UserCard> = ({ data }) => {
  const classes = useUserCardStyles();
  const { login, avatar_url, html_url } = data.owner;
  const [state, dispatch] = useTrackedState();
  const [, dispatchShared] = useTrackedStateShared();
  const [, dispatchStargazers] = useTrackedStateStargazers();
  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    dispatch({
      type: 'REMOVE_ALL',
    });
    dispatchStargazers({
      type: 'REMOVE_ALL',
    });
    dispatchShared({
      type: 'USERNAME_ADDED',
      payload: {
        username: login,
      },
    });
  }
  return (
    <div className="avatarBackground">
      <div className={classes.wrapper}>
        <div className={'bio'} title={state?.cardEnhancement?.get(data.id)?.profile?.bio?.toString() || ''}>
          <img alt="avatar" className="avatar-img" src={avatar_url} />
        </div>
        <div className={classes.nameWrapper}>
          <a href={html_url} onClick={onClick}>
            <strong>{login}</strong>
          </a>
        </div>
        <div className={'github-card'}>
          <ul className={'status'}>
            <li>
              <a>
                <div
                  style={{ width: '16px' }}
                  dangerouslySetInnerHTML={{
                    __html: state?.cardEnhancement?.get(data.id)?.profile?.homeLocation[0]?.toString() || '',
                  }}
                  title={`Location: ${state?.cardEnhancement?.get(data.id)?.profile?.homeLocation[1]?.toString()}`}
                />
              </a>
            </li>

            <li>
              <a>
                <div
                  style={{ width: '16px' }}
                  dangerouslySetInnerHTML={{
                    __html: state?.cardEnhancement?.get(data.id)?.profile?.worksFor[0]?.toString() || '',
                  }}
                  title={`Works at: ${state?.cardEnhancement?.get(data.id)?.profile?.worksFor[1]?.toString()}`}
                />
              </a>
            </li>

            <li>
              <a href={state?.cardEnhancement?.get(data.id)?.profile?.url[1]?.toString()}>
                <div
                  style={{ width: '16px' }}
                  dangerouslySetInnerHTML={{
                    __html: state?.cardEnhancement?.get(data.id)?.profile?.url[0]?.toString() || '',
                  }}
                  title={state?.cardEnhancement?.get(data.id)?.profile?.url[1]?.toString()}
                />
              </a>
            </li>

            <li>
              <a href={state?.cardEnhancement?.get(data.id)?.profile?.twitter[1]?.toString()}>
                <div
                  style={{ width: '16px' }}
                  dangerouslySetInnerHTML={{
                    __html: state?.cardEnhancement?.get(data.id)?.profile?.twitter[0]?.toString() || '',
                  }}
                  title={state?.cardEnhancement?.get(data.id)?.profile?.twitter[1]?.toString()}
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
UserCard.displayName = 'UserCard';
export default UserCard;
