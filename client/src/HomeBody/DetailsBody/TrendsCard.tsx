import React from 'react';
import { GoGraph } from 'react-icons/go';
import { Body, DetailsLayout, Header, Section } from '../../Layout/DetailsLayout';
import { TrendSummary } from './TrendsCardBody/TrendSummary';
import MonthlyTrends from './TrendsCardBody/MonthlyTrends';
import { HeatMapContainer } from './TrendsCardBody/HeatMapContainer';
import { fastFilter } from '../../util';

interface TrendsCardProps {
  project: any;
}

export const TrendsCard = React.memo<TrendsCardProps>(({ project }) => {
  const dailyDeltas = project.timeSeries?.daily || [];
  const numberOfDailyDeltas = fastFilter((delta: any) => delta !== null, dailyDeltas);
  const showHeatMap = numberOfDailyDeltas.length > 1; // show the heatmap only if we at least 2 numbers

  const monthlyDeltas = project.timeSeries && project.timeSeries.monthly;
  const showMonthlyChart = monthlyDeltas && monthlyDeltas.length > 1;

  return (
    <DetailsLayout style={{ marginTop: '2rem' }}>
      <Header>
        <GoGraph className="icon" size={20} />
        TRENDS
      </Header>
      <Body>
        {showMonthlyChart && (
          <Section>
            <MonthlyTrends deltas={monthlyDeltas} />
          </Section>
        )}
        {showHeatMap && (
          <Section>
            <HeatMapContainer deltas={dailyDeltas} />
          </Section>
        )}
        <TrendSummary project={project} />
      </Body>
    </DetailsLayout>
  );
});
TrendsCard.displayName = 'TrendsCard';
