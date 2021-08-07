import { createSelector } from 'reselect';
import { createContainer } from 'unstated-next';
import { useQuery } from '@apollo/client';
import { GET_STAR_RANKING, GET_SUGGESTED_REPO, GET_SUGGESTED_REPO_IMAGES } from '../graphql/queries';
import { StaticState } from '../typing/interface';
import {
  RepoInfoSuggested,
  SeenProps,
  starRanking,
  StarRankingData,
  SuggestedData,
  SuggestedDataImages,
} from '../typing/type';
import { useTrackedStateShared } from './stateContextSelector';
import { useEffect, useRef, useState } from 'react';
//only use when you have a static database (doesn't depend on mutation action by the user)

const useStarRanking = () => {
  const [stateShared] = useTrackedStateShared();
  const [shouldSkip, setShouldSkip] = useState(true);
  const timeRef = useRef<any>();

  useEffect(() => {
    timeRef.current = setTimeout(() => {
      if (!stateShared.isLoggedIn) {
        setShouldSkip(stateShared.isLoggedIn);
      }
    }, 3500);
    return () => {
      clearTimeout(timeRef.current);
    };
  }, [stateShared.isLoggedIn]);

  const {
    data: starRankingData,
    loading: starRankingDataLoading,
    error: starRankingDataError,
  } = useQuery(GET_STAR_RANKING, {
    context: { clientName: 'mongo' },
    skip: shouldSkip,
  });
  return { starRankingData, starRankingDataLoading, starRankingDataError } as StarRankingData;
};
export const StarRankingContainer = createContainer(useStarRanking);
const useSuggestedRepo = () => {
  const [stateShared] = useTrackedStateShared();
  const [shouldSkip, setShouldSkip] = useState(true);
  const timeRef = useRef<any>();
  useEffect(() => {
    timeRef.current = setTimeout(() => {
      if (!stateShared.isLoggedIn) {
        setShouldSkip(stateShared.isLoggedIn);
      }
    }, 3500);
    return () => {
      clearTimeout(timeRef.current);
    };
  }, [stateShared.isLoggedIn]);

  const {
    data: suggestedData,
    loading: suggestedDataLoading,
    error: suggestedDataError,
  } = useQuery(GET_SUGGESTED_REPO, {
    context: { clientName: 'mongo' },
    skip: shouldSkip,
  });
  return { suggestedData, suggestedDataError, suggestedDataLoading } as SuggestedData;
};
export const SuggestedRepoContainer = createContainer(useSuggestedRepo);
export type suggestedDataImages = Pick<SuggestedDataImages, 'suggestedDataImages'>;
const useSuggestedRepoImages = () => {
  const [stateShared] = useTrackedStateShared();
  const [shouldSkip, setShouldSkip] = useState(true);
  const timeRef = useRef<any>();
  useEffect(() => {
    timeRef.current = setTimeout(() => {
      if (!stateShared.isLoggedIn) {
        setShouldSkip(stateShared.isLoggedIn);
      }
    }, 3500);
    return () => {
      clearTimeout(timeRef.current);
    };
  }, [stateShared.isLoggedIn]);

  const {
    data: suggestedDataImages,
    loading: suggestedDataImagesLoading,
    error: suggestedDataImagesError,
  } = useQuery(GET_SUGGESTED_REPO_IMAGES, {
    context: { clientName: 'mongo' },
    skip: shouldSkip,
  });
  return { suggestedDataImages, suggestedDataImagesError, suggestedDataImagesLoading } as SuggestedDataImages;
};
export const SuggestedRepoImagesContainer = createContainer(useSuggestedRepoImages);
function useApolloData(): StaticState {
  return Object.assign(
    {},
    {
      StarRanking: StarRankingContainer.useContainer(),
      SuggestedRepo: SuggestedRepoContainer.useContainer(),
      SuggestedRepoImages: SuggestedRepoImagesContainer.useContainer(),
    }
  );
}
export function useSelector(selector: any) {
  return selector(useApolloData());
}
//don't import createSelector to React component as it will re-create selector (not memoize) when the component gets rerender
export const alreadySeenCardSelector = createSelector<SeenProps[] | [], any, any[]>(
  [(seenCards: SeenProps[]) => seenCards],
  (seenCard: SeenProps[]) => {
    return (
      seenCard?.reduce((acc: any[], obj: SeenProps) => {
        acc.push(obj.id);
        return acc;
      }, []) ?? []
    );
  }
);

export const sortedRepoInfoSelector = (starRankingFiltered: starRanking[], sorted: string) =>
  createSelector<StaticState, any, any[]>(
    [(data: StaticState) => data.SuggestedRepo],
    (suggestedRepo: SuggestedData) => {
      const ids = starRankingFiltered?.map((obj: starRanking) => obj.id);
      return suggestedRepo?.suggestedData?.getSuggestedRepo?.repoInfoSuggested
        ?.slice()
        .sort((a: RepoInfoSuggested, b: RepoInfoSuggested) => {
          return ids.indexOf(a.id) - ids.indexOf(b.id);
        })
        .map((obj: RepoInfoSuggested) => {
          return Object.assign(
            {},
            {
              ...obj,
              trends: starRankingFiltered.find((xx: starRanking) => xx.id === obj.id)
                ? starRankingFiltered!.find((xx: starRanking) => xx.id === obj.id)!['trends'][sorted.toLowerCase()]
                : 0,
            }
          );
        });
    }
  );
export const starRankingFilteredSelector = (sorted: string) =>
  createSelector<StaticState, any, starRanking[]>(
    [(data: StaticState) => data.StarRanking],
    (starRanking: StarRankingData) => {
      return (
        starRanking?.starRankingData?.getStarRanking?.starRanking
          ?.slice()
          .sort(
            (a: starRanking, b: starRanking) => b['trends'][sorted.toLowerCase()] - a['trends'][sorted.toLowerCase()]
          ) ?? []
      );
    }
  );
