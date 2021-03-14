import { createSelector } from 'reselect';
import { fastFilter } from '../util';
//only use when you have a static database (not change everytime the user takes action)

export const alreadySeenCardSelector = createSelector<any, any, []>(
  [(seenCards: any) => seenCards],
  (seenCard: any) => {
    return (
      seenCard?.reduce((acc: any[], obj: { id: number }) => {
        acc.push(obj.id);
        return acc;
      }, []) || []
    );
  }
);
export const getIdsSelector = createSelector<any, any, any[]>([(dataList: any) => dataList], (data: any) => {
  return data.map((obj: any) => obj.id);
});
export const sortedRepoInfoSelector = (sortedIds: any[], starRankingFiltered: any[]) =>
  createSelector<any, any, any[]>([(repoInfos: any) => repoInfos], (repoInfo: any) => {
    return repoInfo
      ?.slice()
      .sort((a: any, b: any) => {
        return sortedIds.indexOf(a.id) - sortedIds.indexOf(b.id);
      })
      .map((obj: any) => {
        const copyObj = Object.assign({}, obj);
        copyObj.trends = starRankingFiltered.find((xx: any) => xx.id === obj.id)
          ? starRankingFiltered.find((xx: any) => xx.id === obj.id).trends.daily
          : 0;
        return copyObj;
      });
  });
export const starRankingFilteredSelector = (ids: number[]) =>
  createSelector<any, any, any[]>([(starRankings: any) => starRankings, (ids: any) => ids], (starRanking: any) => {
    return (
      fastFilter((xx: any) => ids.includes(xx.id), starRanking)
        .reduce((acc: any[], obj: any) => {
          const temp = Object.assign({}, { trends: obj.trends, id: obj.id });
          acc.push(temp);
          return acc;
        }, [])
        .sort((a: any, b: any) => b['trends']['daily'] - a['trends']['daily']) || []
    );
  });
