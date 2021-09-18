import React from 'react';
import { StarDelta } from './StarDelta/StarDelta';

interface TrendSummaryProps {
  item: any;
  trends: any;
}
export const MonthlyTrendsItem = React.memo<TrendSummaryProps>(({ item, trends }) => {
  const { label, category } = item;
  const value = getDeltaByDay(category)({ trends });
  return (
    <div>
      <div>{label}</div>
      <StarDelta value={value} average={category !== 'daily'} />
    </div>
  );
});

export const getDeltaByDay =
  (period: string) =>
  ({ trends }: any) => {
    const periods: any = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      quarterly: 90,
      yearly: 365,
    };

    const delta = trends[period];
    const numberOfDays = periods[period];
    return average(delta, numberOfDays);
  };

function average(delta: number, numberOfDays: number) {
  if (delta === undefined) return undefined; // handle recently added projects, without `yearly`, `monthly` data available
  return round(delta / numberOfDays);
}

function round(number: number, decimals = 1) {
  const i = Math.pow(10, decimals);
  return Math.round(number * i) / i;
}
