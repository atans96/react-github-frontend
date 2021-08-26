import React from 'react';
import { useTrackedState } from '../../../selectors/stateContextSelector';
import clsx from 'clsx';
import { If } from '../../../util/react-if/If';
import { Then } from '../../../util/react-if/Then';
import { WebLink } from '../../../util/icons';

interface CardTitleProps {
  data: { name: string | undefined; id: number };
}
const CardTitle: React.FC<CardTitleProps> = ({ data }) => {
  const [state] = useTrackedState();
  return (
    <a
      onClick={() => window.open(state?.cardEnhancement?.get(data.id)?.webLink)}
      target="_blank"
      href={state?.cardEnhancement?.get(data.id)?.webLink}
      className={clsx('', {
        'title-href-available':
          state?.cardEnhancement?.get(data.id)?.webLink?.length !== undefined &&
          state!.cardEnhancement!.get(data.id)!.webLink?.length > 0,
        'title-href-non-available':
          state?.cardEnhancement?.get(data.id)?.webLink?.length === undefined ||
          state?.cardEnhancement?.get(data.id)?.webLink?.length === 0,
      })}
    >
      <If
        condition={
          state?.cardEnhancement?.get(data.id)?.webLink?.length !== undefined &&
          state!.cardEnhancement!.get(data.id)!.webLink?.length > 0
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
