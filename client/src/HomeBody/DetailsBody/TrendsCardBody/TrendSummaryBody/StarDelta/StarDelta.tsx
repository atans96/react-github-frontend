import React from 'react';
import numeral from 'numeral';

import { MdStarBorder } from 'react-icons/md';

interface StarProps {
  value: number;
}

interface StarDeltaProps {
  average: boolean;
  [x: string]: any;
}

interface StarTotalProps extends StarProps {
  size: number;
}

const getSign = (value: number) => {
  if (value === 0) return '';
  return value > 0 ? '+' : '-';
};

export const StarDelta: React.FC<StarDeltaProps> = ({ average, value, ...props }) =>
  average ? <StarDeltaAverage {...props} value={value} /> : <StarDeltaNormal {...props} value={value} />;

const StarDeltaNormal: React.FC<StarProps> = ({ value, ...props }) => {
  const sign = getSign(value);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {value === 0 ? (
        '='
      ) : (
        <>
          <span style={{ marginRight: 2 }}>{sign}</span>
          <span>{Math.abs(value)}</span>
          <MdStarBorder {...props} />
        </>
      )}
    </div>
  );
};
export const StarDeltaAverage: React.FC<StarProps> = ({ value }) => {
  const integerPart = Math.abs(Math.trunc(value));
  const decimalPart = (Math.abs(value - integerPart) * 10).toFixed().slice(0, 1);
  const sign = getSign(value);

  if (value === undefined) return <div className="star-delta text-secondary text-small">N/A</div>;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ marginRight: 2 }}>{sign}</span>
        <span>{integerPart}</span>
        <span className="text-small">.{decimalPart}</span>
        <MdStarBorder />
        <span> /day</span>
      </div>
    </div>
  );
};

export const StarTotal: React.FC<StarTotalProps> = ({ value, size = 14 }) => {
  const digits = value > 1000 && value < 10000 ? '0.0' : '0';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span>{numeral(value).format(digits + ' a')}</span>
      <MdStarBorder size={size} />
    </span>
  );
};
