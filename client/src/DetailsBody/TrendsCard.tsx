import React from 'react';
import { GoGraph } from 'react-icons/go';
import { TrendSummary } from './TrendsCardBody/TrendSummary';
import MonthlyTrends from './TrendsCardBody/MonthlyTrends';
import { HeatMapContainer } from './TrendsCardBody/HeatMapContainer';
import { fastFilter } from '../util';
import { starRanking } from '../typing/type';
import '../Details.scss';

interface TrendsCardProps {
  project: starRanking;
}

export const TrendsCard = React.memo<TrendsCardProps>(({ project }) => {
  const dailyDeltas = project.timeSeries?.daily ?? [];
  const numberOfDailyDeltas = fastFilter((delta: any) => delta !== null, dailyDeltas);
  const showHeatMap = numberOfDailyDeltas.length > 1; // show the heatmap only if we at least 2 numbers

  const monthlyDeltas = project.timeSeries && project.timeSeries.monthly;
  const showMonthlyChart = monthlyDeltas && monthlyDeltas.length > 1;

  return (
    <div className={'background-readme'} style={{ marginTop: '2rem' }}>
      <div className={'header'}>
        <GoGraph className="icon" size={20} />
        TRENDS
      </div>
      <div>
        {showMonthlyChart && (
          <div className={'section'}>
            <MonthlyTrends deltas={monthlyDeltas} />
          </div>
        )}
        {showHeatMap && (
          <div className={'section'}>
            <HeatMapContainer deltas={dailyDeltas} />
          </div>
        )}
        <TrendSummary project={project} />
      </div>
    </div>
  );
});
TrendsCard.displayName = 'TrendsCard';
