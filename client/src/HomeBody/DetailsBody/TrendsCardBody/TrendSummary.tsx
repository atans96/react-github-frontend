import React from 'react';
import { OnlyYesterday } from './TrendSummaryBody/OnlyYesterday';
import { Section } from '../../../Layout/DetailsLayout';
import styled from 'styled-components';
import { MonthlyTrendsItem } from './TrendSummaryBody/MonthlyTrendsItem';
import { fastFilter } from '../../../util';

interface TrendSummaryProps {
  project: any;
}
const Div = styled.div`
  width: 100%;
  display: flex;
  > div {
    flex: 1;
    text-align: center;
  }
  @media (max-width: 600px) {
    flex-direction: column;
    > div:not(:first-child) {
      margin-top: 0.5rem;
    }
  }
`;

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
    <Section>
      {trends.weekly || trends.weekly === 0 ? (
        <div>
          <p>Stars added on GitHub, per day, on average</p>
          <Div>
            {items.map((item, idx) => (
              <MonthlyTrendsItem item={item} key={idx} trends={trends} />
            ))}
          </Div>
        </div>
      ) : (
        <OnlyYesterday trends={trends} />
      )}
    </Section>
  );
});
TrendSummary.displayName = 'TrendSummary';
