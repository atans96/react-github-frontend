import { PropsWithChildren } from 'react';
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
export type suggestedData = {
  getSuggestedRepo: { userName: string; repoInfo: [RepoInfoSuggested] };
};
export type SuggestedData = {
  suggestedData: suggestedData;
  suggestedDataLoading: any;
  suggestedDataError: any;
};
export type Trends = {
  daily: number;
  weekly: number;
  monthly: number;
  quarterly: number;
  yearly: number;
};
export type Monthly = {
  year: number;
  months: number;
  firstDay: number;
  lastDay: number;
  delta: number;
};
export type TimeSeries = {
  daily: [number];
  monthly: [Monthly];
};
export type starRanking = {
  id: number;
  trends: Trends | any;
  timeSeries: TimeSeries;
};
export type StarRanking = {
  getStarRanking: { userName: string; starRanking: Nullable<[starRanking]> };
};
export type StarRankingData = {
  starRankingData: StarRanking;
  starRankingDataLoading: any;
  starRankingDataError: any;
};
export type RenderImages = {
  id: number;
  value: [string];
};
export type suggestedDataImages = { userName: string; getSuggestedRepoImages: [RenderImages] };
export type SuggestedDataImages = {
  suggestedDataImages: suggestedDataImages;
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
        nodes: Array<{
          name: string;
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
  topics: [string];
  html_url: string;
  name: string;
  imagesData: [string];
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
export type MergedDataProps = {
  id: number;
  stargazers_count: string;
  full_name: string;
  default_branch: string;
  owner: OwnerProps;
  name: string;
  description: string;
  language: string;
  topics: string[];
  html_url: string;
  viewerHasStarred?: boolean;
  trends?: number;
  [key: string]: any;
};
export type LanguagePreference = {
  language: string;
  checked: boolean;
};
export type UserData = {
  tokenRSS: string;
  languagePreference: LanguagePreference[];
  code: string;
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
  userName: string;
  repoInfo: RepoInfo[] | [];
  repoContributions: RepoContributions[];
  languages: string[];
};
export type Seen = {
  stargazers_count: number;
  full_name: string;
  owner: OwnerProps;
  description: string;
  language: string;
  topics: string[] | [];
  html_url: string;
  name: string;
  id: number;
  default_branch: string;
  imagesData: string[] | [];
  is_queried: boolean;
};
export type Clicked = {
  is_queried: boolean;
  full_name: string;
  owner: Omit<OwnerProps, 'html_url' | 'avatar_url'>;
};
export type ClickedData = {
  userName: string;
  clicked: Nullable<Clicked[] | []>;
};
export type RSSFeedData = {
  userName: string;
  rss: string[];
  lastSeen: string[];
};
export type SeenData = {
  seenCards: Nullable<Seen[] | []>;
};
export type SearchesData = {
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
