import React from 'react';
import { HasNextPage, MergedDataProps, Nullable, RateLimit, SeenProps } from '../typing/type';

export const dispatchRateLimit = (core: RateLimit, graphql: RateLimit, dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'RATE_LIMIT',
    payload: {
      limit: core.limit,
      used: core.used,
      reset: core.reset,
    },
  });

  dispatch({
    type: 'RATE_LIMIT_GQL',
    payload: {
      limit: graphql.limit,
      used: graphql.used,
      reset: graphql.reset,
    },
  });
};
export const dispatchRateLimitAnimation = (rateLimitAnimationAdded: boolean, dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'RATE_LIMIT_ADDED',
    payload: {
      rateLimitAnimationAdded: rateLimitAnimationAdded,
    },
  });
};
export const dispatchLastPageDiscover = (lastPage: Nullable<number>, dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'LAST_PAGE_DISCOVER',
    payload: {
      lastPageDiscover: lastPage,
    },
  });
};
export const dispatchLastPage = (lastPage: Nullable<number>, dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'LAST_PAGE',
    payload: {
      lastPage: lastPage,
    },
  });
};
export const dispatchImagesData = (images: any, dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'IMAGES_DATA_ADDED',
    payload: {
      images: images,
    },
  });
};
export const dispatchImagesDataDiscover = (images: any, dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'IMAGES_DATA_ADDED_DISCOVER',
    payload: {
      images: images,
    },
  });
};
export const dispatchAppendMergedDataDiscover = (data: MergedDataProps[], dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'MERGED_DATA_APPEND_DISCOVER',
    payload: {
      data: data,
    },
  });
};
export const dispatchAppendMergedData = (data: MergedDataProps[], dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'MERGED_DATA_APPEND',
    payload: {
      data: data,
    },
  });
};
export const dispatchMergedData = (data: MergedDataProps[] | SeenProps[], dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'MERGED_DATA_ADDED',
    payload: {
      data: data,
    },
  });
};
export const dispatchSearchUsers = (data: any, dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'SEARCH_USERS',
    payload: {
      data: data,
    },
  });
};
export const dispatchLoading = (isLoading: boolean, dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'LOADING',
    payload: {
      isLoading: isLoading,
    },
  });
};
export const dispatchVisible = (visible: boolean, dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'VISIBLE',
    payload: {
      visible: visible,
    },
  });
};
export const dispatchExpandedImages = (expanded: boolean, dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'EXPANDED_IMAGES',
    payload: {
      expanded: expanded,
    },
  });
};
export const dispatchUsername = (username: string | string[], dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'USERNAME_ADDED',
    payload: {
      username: username,
    },
  });
};
export const dispatchPage = (dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'ADVANCE_PAGE',
  });
};
export const dispatchPageDiscover = (dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'ADVANCE_PAGE_DISCOVER',
  });
};
export const dispatchPerPage = (perPage: string, dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'PER_PAGE',
    payload: {
      perPage: perPage,
    },
  });
};
export const dispatchStargazersInfo = (stargazersData: any, dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'STARGAZERS_ADDED',
    payload: {
      stargazersData: stargazersData,
    },
  });
};
export const dispatchStargazersHasNextPage = (hasNextPage: Partial<HasNextPage>, dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'STARGAZERS_HAS_NEXT_PAGE',
    payload: {
      hasNextPage: hasNextPage,
    },
  });
};
export const dispatchStargazersUsers = (stargazersUsers: number, dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'STARGAZERS_USERS',
    payload: {
      stargazersUsers: stargazersUsers,
    },
  });
};
export const dispatchStargazersUsersRepos = (
  stargazersUsersStarredRepositories: number,
  dispatch: React.Dispatch<any>
) => {
  dispatch({
    type: 'STARGAZERS_USERS_REPOS',
    payload: {
      stargazersUsersStarredRepositories: stargazersUsersStarredRepositories,
    },
  });
};
export const dispatchShouldFetchImagesData = (shouldFetchImages: boolean, dispatch: React.Dispatch<any>) => {
  dispatch({
    type: 'SHOULD_IMAGES_DATA_ADDED',
    payload: {
      shouldFetchImages: shouldFetchImages,
    },
  });
};
