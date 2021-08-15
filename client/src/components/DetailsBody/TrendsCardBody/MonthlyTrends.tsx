import React from 'react';
import { MonthlyChart } from './MonthlyTrendsBody/MonthlyChart';

export const MonthlyTrends = ({ deltas }: any) => {
  const values = deltas.map(({ year, month, delta }: any) => ({
    year,
    month,
    value: delta,
  }));
  return (
    <>
      <p>Stars added on GitHub, month by month</p>
      <MonthlyChart values={values} showPlusSymbol />
    </>
  );
};
export default MonthlyTrends;
