import React from 'react';
import clsx from 'clsx';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { WebLink } from '../../util/icons';
import { HomeStore } from '../../store/Home/reducer';

interface CardTitleProps {
  data: { name: string | undefined; id: number };
}
const CardTitle: React.FC<CardTitleProps> = ({ data }) => {
  const { cardEnhancement } = HomeStore.store().CardEnhancement();
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={cardEnhancement?.get(data.id)?.webLink}
      className={clsx('', {
        'title-href-available':
          cardEnhancement?.get(data.id)?.webLink?.length !== undefined &&
          cardEnhancement!.get(data.id)!.webLink?.length > 0,
        'title-href-non-available':
          cardEnhancement?.get(data.id)?.webLink?.length === undefined ||
          cardEnhancement?.get(data.id)?.webLink?.length === 0,
      })}
    >
      <If
        condition={
          cardEnhancement?.get(data.id)?.webLink?.length !== undefined &&
          cardEnhancement!.get(data.id)!.webLink?.length > 0
        }
      >
        <span>
          <Then>
            <WebLink />
          </Then>
        </span>
      </If>
      <h3 style={{ textAlign: 'center', overflowWrap: 'anywhere' }}>
        <strong>{data?.name?.toUpperCase().replace(/[_-]/g, ' ')}</strong>
      </h3>
    </a>
  );
};
CardTitle.displayName = 'CardTitle';
export default CardTitle;
