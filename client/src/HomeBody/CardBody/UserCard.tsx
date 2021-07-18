import React from 'react';
import { useUserCardStyles } from '../../DiscoverBody/CardDiscoverBody/UserCardStyle';
import { CardEnhancement, OwnerProps } from '../../typing/type';
import clsx from 'clsx';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { SharedStore } from '../../store/Shared/reducer';
import { StargazersStore } from '../../store/Staargazers/reducer';
import { HomeStore } from '../../store/Home/reducer';

interface UserCard {
  data: { owner: OwnerProps; id: number };
}

const UserCard: React.FC<UserCard> = ({ data }) => {
  const { cardEnhancement } = HomeStore.store().CardEnhancement();
  const classes = useUserCardStyles();
  const { login, avatar_url, html_url } = data.owner;
  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    HomeStore.dispatch({
      type: 'REMOVE_ALL',
    });
    StargazersStore.dispatch({
      type: 'REMOVE_ALL',
    });
    SharedStore.dispatch({
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
            bio: !!cardEnhancement.get(data.id)?.profile?.bio?.toString().length,
          })}
          title={cardEnhancement.get(data.id)?.profile?.bio?.toString() || ''}
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
                cardEnhancement?.get(data.id)?.profile?.homeLocation[1]?.toString() !== undefined &&
                cardEnhancement!.get(data.id)!.profile?.homeLocation[1]?.toString().length > 0
              }
            >
              <Then>
                <li>
                  <a>
                    <div
                      style={{ width: '16px' }}
                      dangerouslySetInnerHTML={{
                        __html: cardEnhancement?.get(data.id)?.profile?.homeLocation[0]?.toString() || '',
                      }}
                      title={`Location: ${cardEnhancement?.get(data.id)?.profile?.homeLocation[1]?.toString()}`}
                    />
                  </a>
                </li>
              </Then>
            </If>

            <If
              condition={
                cardEnhancement.get(data.id)?.profile?.worksFor[1]?.toString() !== undefined &&
                cardEnhancement!.get(data.id)!.profile?.worksFor[1]?.toString().length > 0
              }
            >
              <Then>
                <li>
                  <a>
                    <div
                      style={{ width: '16px' }}
                      dangerouslySetInnerHTML={{
                        __html: cardEnhancement?.get(data.id)?.profile?.worksFor[0]?.toString() || '',
                      }}
                      title={`Works at: ${cardEnhancement?.get(data.id)?.profile?.worksFor[1]?.toString()}`}
                    />
                  </a>
                </li>
              </Then>
            </If>

            <If
              condition={
                cardEnhancement.get(data.id)?.profile?.url[1]?.toString() !== undefined &&
                cardEnhancement!.get(data.id)!.profile?.url[1]?.toString().length > 0
              }
            >
              <Then>
                <li>
                  <a href={cardEnhancement?.get(data.id)?.profile?.url[1]?.toString()}>
                    <div
                      style={{ width: '16px' }}
                      dangerouslySetInnerHTML={{
                        __html: cardEnhancement?.get(data.id)?.profile?.url[0]?.toString() || '',
                      }}
                      title={cardEnhancement?.get(data.id)?.profile?.url[1]?.toString()}
                    />
                  </a>
                </li>
              </Then>
            </If>

            <If
              condition={
                cardEnhancement.get(data.id)?.profile?.twitter[1]?.toString() !== undefined &&
                cardEnhancement!.get(data.id)!.profile?.twitter[1]?.toString().length > 0
              }
            >
              <li>
                <a
                  href={HomeStore.store()
                    .CardEnhancement()
                    ?.cardEnhancement?.get(data.id)
                    ?.profile?.twitter[1]?.toString()}
                >
                  <div
                    style={{ width: '16px' }}
                    dangerouslySetInnerHTML={{
                      __html: cardEnhancement?.get(data.id)?.profile?.twitter[0]?.toString() || '',
                    }}
                    title={cardEnhancement?.get(data.id)?.profile?.twitter[1]?.toString()}
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
