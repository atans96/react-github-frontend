import React from 'react';
import { useTrackedState } from '../../selectors/stateContextSelector';

interface CardTitleProps {
  data: { name: string | undefined; id: number };
}
const CardTitle: React.FC<CardTitleProps> = ({ data }) => {
  const [state] = useTrackedState();
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={state?.cardEnhancement?.get(data.id)?.webLink}
      style={
        state?.cardEnhancement?.get(data.id)?.webLink?.length !== undefined &&
        state!.cardEnhancement!.get(data.id)!.webLink?.length === 0
          ? { textDecoration: 'none' }
          : {}
      }
    >
      <h3 style={{ textAlign: 'center', overflowWrap: 'anywhere' }}>
        <strong>{data?.name?.toUpperCase().replace(/[_-]/g, ' ')}</strong>
      </h3>
    </a>
  );
};
CardTitle.displayName = 'CardTitle';
export default CardTitle;
