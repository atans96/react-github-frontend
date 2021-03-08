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
export type ContributorsProps = {
  login: string;
  avatar_url: string;
  contributions: number;
};
export type RenderImagesProps = {
  id: string;
  filteredImages: string[];
};
export type SubscribeUsersProps = {
  login: string;
  avatarUrl: string;
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
