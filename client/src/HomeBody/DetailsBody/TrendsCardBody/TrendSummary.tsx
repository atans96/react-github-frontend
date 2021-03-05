import React from 'react';
import { OnlyYesterday } from './TrendSummaryBody/OnlyYesterday';
import { Section } from '../../../Layout/DetailsLayout';
import styled from 'styled-components';
import { MonthlyTrendsItem } from './TrendSummaryBody/MonthlyTrendsItem';

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
  const items = [
    { label: 'Yesterday', category: 'daily' },
    { label: 'Last week', category: 'weekly' },
    { label: 'Last month', category: 'monthly' },
    { label: 'Last 12 months', category: 'yearly' },
  ].filter(({ category }) => {
    const value = trends[category];
    return value !== undefined && value !== null;
  });
  return (
    <Section>
      {trends.weekly || trends.weekly === 0 ? (
        <div>
          <p>Stars added on GitHub, per day, on average</p>
          <Div>
            {items.map((item, i) => (
              <MonthlyTrendsItem item={item} key={i} trends={trends} />
            ))}
          </Div>
        </div>
      ) : (
        <OnlyYesterday trends={trends} />
      )}
    </Section>
  );
});
