import React from 'react';
import { OnlyYesterday } from './TrendSummaryBody/OnlyYesterday';
import { MonthlyTrendsItem } from './TrendSummaryBody/MonthlyTrendsItem';
import { fastFilter } from '../../../util';
import './TrendSummaryStyle.scss';

interface TrendSummaryProps {
  project: any;
}

export const TrendSummary = React.memo<TrendSummaryProps>(({ project }) => {
  const { trends } = project;
  const items = fastFilter(
    ({ category }: any) => {
      const value = trends[category];
      return value !== undefined && value !== null;
    },
    [
      { label: 'Yesterday', category: 'daily' },
      { label: 'Last week', category: 'weekly' },
      { label: 'Last month', category: 'monthly' },
      { label: 'Last 12 months', category: 'yearly' },
    ]
  );
  return (
    <div className={'section'}>
      {trends.weekly || trends.weekly === 0 ? (
        <div>
          <p>Stars added on GitHub, per day, on average</p>
          <div className={'monthly-trends-container'}>
            {items.map((item, idx) => (
              <MonthlyTrendsItem item={item} key={idx} trends={trends} />
            ))}
          </div>
        </div>
      ) : (
        <OnlyYesterday trends={trends} />
      )}
    </div>
  );
});
TrendSummary.displayName = 'TrendSummary';
