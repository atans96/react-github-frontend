import React from 'react';
import { MdStarBorder } from 'react-icons/md';
interface OnlyYesterdayProps {
  trends: any;
}

export const OnlyYesterday = React.memo<OnlyYesterdayProps>(({ trends }) => {
  const value = trends.daily;
  if (value === 0) return <div>No star added on GitHub yesterday</div>;
  return value > 0 ? (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {value}
      <MdStarBorder /> added yesterday
    </div>
  ) : (
    <div>
      {value}
      <MdStarBorder /> lost yesterday
    </div>
  );
});
OnlyYesterday.displayName = 'OnlyYesterday';
