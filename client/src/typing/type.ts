import React, { PropsWithChildren } from 'react';
import { RouteProps } from 'react-router-dom';
import { ApolloClient } from '@apollo/client';
export type Client = ApolloClient<Record<string, any>>;
export type Pick2<T, K1 extends keyof T, K2 extends keyof T[K1]> = {
  //https://gist.github.com/staltz/368866ea6b8a167fbdac58cddf79c1bf
  [P1 in K1]: {
    [P2 in K2]: T[K1][P2];
  };
};
export type Route = Omit<RouteProps, 'component' | 'render'> & {
  name: string;
  children?: Route[];
  lazy?: boolean;
  component: React.ComponentType<any>;
  meta?: Record<string, any>;
  render?: (custom: any) => RouteProps['render'];
};
export type RepoInfoProps = {
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  updatedAt: Date;
  language: string;
  topics: string[];
  defaultBranch: string;
  html_url: string;
  readme: string;
};
export enum ActionResolvedPromise {
  append = 'append',
  noData = 'noData',
  error = 'error',
  nonAppend = 'nonAppend',
  end = 'end',
}
export type RepoInfoSuggested = {
  from: string;
  is_seen: boolean;
  stargazers_count: number;
  full_name: string;
  default_branch: string;
  owner: OwnerProps;
  description: string;
  language: string;
  topics: [string];
  html_url: string;
  id: number;
  name: string;
};
export type SuggestedData = {
  suggestedData: { getSuggestedRepo: { repoInfoSuggested: [RepoInfoSuggested] } };
  suggestedDataLoading: any;
  suggestedDataError: any;
};
type Trends = {
  daily: number;
  weekly: number;
  monthly: number;
  quarterly: number;
  yearly: number;
};
type Monthly = {
  year: number;
  months: number;
  firstDay: number;
  lastDay: number;
  delta: number;
};
type TimeSeries = {
  daily: [number];
  monthly: [Monthly];
};
export type starRanking = {
  id: number;
  trends: Trends | any;
  timeSeries: TimeSeries;
};
export type StarRankingData = {
  starRankingData: { getStarRanking: { starRanking: Nullable<[starRanking]> } };
  starRankingDataLoading: any;
  starRankingDataError: any;
};
export type RenderImages = {
  id: number;
  value: [string];
};
export type SuggestedDataImages = {
  suggestedDataImages: { getSuggestedRepoImages: [RenderImages] };
  suggestedDataImagesLoading: any;
  suggestedDataImagesError: any;
};
export type ContributorProps = {
  login: string;
  avatar_url: string;
  contributions: number;
};
export type ContributorsProps = {
  fullName: string;
  contributors: ContributorProps[];
};
export type RenderImagesProps = {
  id: string;
  filteredImages: string[];
};
export type Profile = {
  bio: string;
  homeLocation: string[];
  twitter: string[];
  url: string[];
  worksFor: string[];
};
export type CardEnhancement = {
  id: number;
  profile: Profile;
  webLink: string;
};
export type StargazerProps = {
  id: string;
  starredRepositories: {
    [x: string]: any;
    nodes: Array<{
      [x: string]: any;
      languages: {
        [x: string]: any;
        edges: Array<{
          node: { name: string };
          size: number;
        }>;
      };
    }>;
  };
  login: string;
  isQueue: boolean;
  avatarUrl: string;
  [x: string]: any;
};
export type SeenProps = {
  id: number;
  default_branch: string;
  stargazers_count: number;
  full_name: string;
  owner: OwnerProps;
  description: string;
  language: string;
  topics: string[];
  html_url: string;
  name: string;
  is_queried: boolean;
};
export type TopicsProps = {
  topic: string;
  count: number;
  clicked: boolean;
};
export type OwnerProps = {
  login: string;
  avatar_url: string;
  html_url: string;
};
export type ImagesDataProps = {
  id: number;
  value: string[];
};
export type MergedDataProps = SeenProps & {
  viewerHasStarred?: boolean;
  trends?: number;
  [key: string]: any;
};
export type LanguagePreference = {
  language: string;
  checked: boolean;
};
export type GithubLanguages = {
  language: string;
  color: string;
  type: string;
  ace_mode: string;
  id: number;
  group: string;
};
export type UserData = {
  tokenRSS: string;
  languagePreference: LanguagePreference[];
  userName: string;
  avatar: string;
  token: string;
  joinDate: Date;
};
export type RepoInfo = {
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  updatedAt: string;
  language: string;
  topics: Nullable<string[] | []>;
  defaultBranch: string;
  html_url: string;
  readme: string;
};
export type Contributors = {
  login: string;
  avatar_url: string;
  contributions: number;
};
export type RepoContributions = {
  fullName: string;
  contributors: Nullable<Contributors[] | []>;
};
export type UserInfoData = {
  repoInfo: RepoInfo[] | [];
  repoContributions: RepoContributions[];
  languages: string[];
};
export type Clicked = {
  is_queried: boolean;
  full_name: string;
  owner: Omit<OwnerProps, 'html_url' | 'avatar_url'>;
};
export type Searches = {
  search: string;
  count: number;
  updatedAt: Date;
};
export type RouterProps = {
  location: string; // This one is coming from the router
};
export type Nullable<T> = T | undefined | null;
export type RateLimit = {
  limit: string;
  used: string;
  reset: string;
};
export type HasNextPage = {
  hasNextPage: boolean;
  endCursor: string;
  startCursor: string;
};
export type BooleanLike = boolean | string | number | null | undefined;

/**
 * Props for a React component that have both children
 * as well as a `condition` prop that is supported by this library
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ComponentWithConditionProps
  extends PropsWithChildren<{
    condition: (() => BooleanLike) | BooleanLike;
  }> {}
