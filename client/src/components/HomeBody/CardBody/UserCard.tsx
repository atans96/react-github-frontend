import React from 'react';
import { useUserCardStyles } from '../../DiscoverBody/CardDiscoverBody/UserCardStyle';
import { OwnerProps } from '../../../typing/type';
import {
  useTrackedState,
  useTrackedStateShared,
  useTrackedStateStargazers,
} from '../../../selectors/stateContextSelector';
import clsx from 'clsx';
import { If } from '../../../util/react-if/If';
import { Then } from '../../../util/react-if/Then';
import { defaultIsFetchFinish, defaultNotification, useIsFetchFinish, useNotification } from '../../Home';

interface UserCard {
  data: { owner: OwnerProps; id: number };
}

const UserCard: React.FC<UserCard> = ({ data }) => {
  const [, setNotification] = useNotification();
  const [, setIsFetchFinish] = useIsFetchFinish();

  const classes = useUserCardStyles();
  const { login, avatar_url, html_url } = data.owner;
  const [state, dispatch] = useTrackedState();
  const [, dispatchShared] = useTrackedStateShared();
  const [, dispatchStargazers] = useTrackedStateStargazers();
  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setNotification({ ...defaultNotification });
    setIsFetchFinish({ ...defaultIsFetchFinish });
    dispatch({
      type: 'REMOVE_ALL',
    });
    dispatchStargazers({
      type: 'REMOVE_ALL',
    });
    dispatchShared({
      type: 'QUERY_USERNAME',
      payload: {
        queryUsername: login,
      },
    });
  }
  return (
    <div className="avatarBackground">
      <div className={classes.wrapper}>
        <div
          className={clsx('', {
            bio: !!state?.cardEnhancement?.get(data.id)?.profile?.bio?.toString().length,
          })}
          title={state?.cardEnhancement?.get(data.id)?.profile?.bio?.toString() || ''}
        >
          <img alt="avatar" className="avatar-img" src={avatar_url} />
        </div>
        <div className={classes.nameWrapper}>
          <a href={html_url} onClick={onClick} target="_blank" rel="noopener noreferrer">
            <strong>{login}</strong>
          </a>
        </div>
        <div className={'github-card'}>
          <ul className={'status'}>
            <If
              condition={
                state?.cardEnhancement?.get(data.id)?.profile?.homeLocation[1]?.toString() !== undefined &&
                state!.cardEnhancement!.get(data.id)!.profile?.homeLocation[1]?.toString().length > 0
              }
            >
              <Then>
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
              </Then>
            </If>

            <If
              condition={
                state?.cardEnhancement?.get(data.id)?.profile?.worksFor[1]?.toString() !== undefined &&
                state!.cardEnhancement!.get(data.id)!.profile?.worksFor[1]?.toString().length > 0
              }
            >
              <Then>
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
              </Then>
            </If>

            <If
              condition={
                state?.cardEnhancement?.get(data.id)?.profile?.url[1]?.toString() !== undefined &&
                state!.cardEnhancement!.get(data.id)!.profile?.url[1]?.toString().length > 0
              }
            >
              <Then>
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
              </Then>
            </If>

            <If
              condition={
                state?.cardEnhancement?.get(data.id)?.profile?.twitter[1]?.toString() !== undefined &&
                state!.cardEnhancement!.get(data.id)!.profile?.twitter[1]?.toString().length > 0
              }
            >
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
            </If>
          </ul>
        </div>
      </div>
    </div>
  );
};
UserCard.displayName = 'UserCard';
export default UserCard;
