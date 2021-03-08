import { createSelector } from 'reselect';
import { MergedDataProps } from '../typing/type';
import { IState } from '../typing/interface';
import { ApolloFactory } from '../hooks/useApolloFactory';
import { fastFilter } from '../util';
//only use when you have a static database (not change everytime the user takes action)
const selectFunction = {
  data: {
    images: (state: IState) => state.imagesData,
    mergedData: (state: IState) => state.mergedData,
  },
  discover: {
    'images-discover': (state: IState) => state.imagesDataDiscover,
    'mergedData-discover': (state: IState) => state.mergedDataDiscover,
  },
};
export const alreadySeenCardSelector = createSelector<any, any, []>(
  [(seenCards: any) => seenCards],
  (seenCard: any) => {
    const alreadySeenCards =
      seenCard.reduce((acc: any[], obj: { id: number }) => {
        acc.push(obj.id);
        return acc;
      }, []) || [];
    return alreadySeenCards;
  }
);
export const getIdsSelector = createSelector<any, any, any[]>([(dataList: any) => dataList], (data: any) => {
  return data.map((obj: any) => obj.id);
});
export const sortedRepoInfoSelector = (sortedIds: any[], starRankingFiltered: any[]) =>
  createSelector<any, any, any[]>([(repoInfos: any) => repoInfos], (repoInfo: any) => {
    const result = repoInfo
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
    return result;
  });
export const starRankingFilteredSelector = (ids: number[]) =>
  createSelector<any, any, any[]>([(starRankings: any) => starRankings, (ids: any) => ids], (starRanking: any) => {
    const starRankingFiltered =
      fastFilter((xx: any) => ids.includes(xx.id), starRanking)
        .reduce((acc: any[], obj: any) => {
          const temp = Object.assign({}, { trends: obj.trends, id: obj.id });
          acc.push(temp);
          return acc;
        }, [])
        .sort((a: any, b: any) => b['trends']['daily'] - a['trends']['daily']) || [];
    return starRankingFiltered;
  });
export const mutationSeenAddedSelector = (callback: any, dispatch: any, condition: boolean, type: string) =>
  createSelector<IState, any, () => void>(
    [selectFunction[type].images, selectFunction[type].mergedData, (state) => state.isLoggedIn],
    (mergedData: MergedDataProps[], imagesData: any[], isLoggedIn: boolean) => {
      if (condition) {
        dispatch();
        const result = mergedData.reduce((acc: any[], obj: MergedDataProps) => {
          const temp = Object.assign(
            {},
            {
              stargazers_count: obj.stargazers_count,
              full_name: obj.full_name,
              default_branch: obj.default_branch,
              owner: {
                login: obj.owner.login,
                avatar_url: obj.owner.avatar_url,
                html_url: obj.owner.html_url,
              },
              description: obj.description,
              language: obj.language,
              topics: obj.topics,
              html_url: obj.html_url,
              id: obj.id,
              imagesData: fastFilter((xx: any) => xx.id === obj.id, imagesData).map((obj) => [...obj.value])[0] || [],
              name: obj.name,
              is_queried: false,
            }
          );
          acc.push(temp);
          return acc;
        }, [] as any[]);
        if (result.length > 0 && imagesData.length > 0 && isLoggedIn) {
          return callback(result);
        }
      }
    }
  );

export function useApolloFactorySelector(selector: any) {
  const state = ApolloFactory.useContainer();
  return selector(state);
}
