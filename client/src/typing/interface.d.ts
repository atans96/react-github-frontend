import React, { ReactNode, CSSProperties, TransitionEvent, MouseEvent, MutableRefObject, Dispatch } from 'react';

import {
  ActionResolvedPromise,
  ContributorsProps,
  HasNextPage,
  ImagesDataProps,
  MergedDataProps,
  Nullable,
  RateLimit,
  RenderImagesProps,
  RepoInfoProps,
  SearchesData,
  SeenData,
  SeenProps,
  StargazerProps,
  StarRankingData,
  SuggestedData,
  SuggestedDataImages,
  TopicsProps,
  UserData,
  UserInfoData,
  WatchUsersData,
} from './type';
import { ActionShared } from '../store/Shared/reducer';
import { Action } from '../store/Home/reducer';
import { ActionStargazers } from '../store/Staargazers/reducer';
import { ActionDiscover } from '../store/Discover/reducer';
import { ActionManageProfile } from '../store/ManageProfile/reducer';
import { ActionRateLimit } from '../store/RateLimit/reducer';
interface Output {
  isFetchFinish: boolean;
}

export interface ActionResolvePromiseOutput {
  actionResolvePromise: (
    action: ActionResolvedPromise,
    setLoading: any,
    setNotification: any,
    isFetchFinish: boolean,
    displayName: string,
    data?: Nullable<IDataOne | any>,
    error?: string
  ) => Output;
}
export interface IAction<T> {
  type: T;
  payload?: any;
}
export interface IDataOne {
  dataOne: MergedDataProps[];
  error_404: string;
  error_403: string;
  paginationInfoData: number;
  renderImages: RenderImagesProps[];
}
export interface IStateStargazers {
  stargazersData: StargazerProps[];
  stargazersQueueData: StargazerProps[];
  language: string;
  hasNextPage: HasNextPage;
  stargazersUsers: number;
  stargazersUsersStarredRepositories: number;
}
export interface IStateShared {
  width: number;
  perPage: number;
  fetchDataPath: string;
  username: string[];
  tokenRSS: string;
  tokenGQL: string;
  drawerWidth: number;
  isLoggedIn: boolean;
  languagesInfo: [];
  client_id: Nullable<string>;
  redirect_uri: Nullable<string>;
  client_secret: Nullable<string>;
  proxy_url: string;
}
export interface IStateDiscover {
  visibleDiscover: boolean;
  isLoadingDiscover: boolean;
  notificationDiscover: string;
  mergedDataDiscover: MergedDataProps[]; // assign object of MergedData to your array
  filterMergedDataDiscover: MergedDataProps[];
  pageDiscover: number;
  lastPageDiscover: number;
}
export interface IStateRateLimit {
  rateLimit: Partial<RateLimit>; // can be initialized with empty object in initialState
  rateLimitGQL: Partial<RateLimit>; // can be initialized with empty object in initialState
  rateLimitAnimationAdded: boolean;
}
export interface IStateManageProfile {
  contributors: ContributorsProps[];
  repoInfo: RepoInfoProps[];
}
export interface IState {
  repoStat: [];
  imagesMapData: Map<number, any>;
  filterBySeen: boolean;
  shouldFetchImages: boolean;
  topics: TopicsProps[];
  filteredTopics: string[];
  mergedData: MergedDataProps[];
  undisplayMergedData: SeenProps[];
  filteredMergedData: MergedDataProps[];
  imagesData: ImagesDataProps[];
  searchUsers: Array<{ [x: string]: string }>;
  visible: boolean;
  isLoading: boolean;
  page: number;
  lastPage: number;
}
export interface GraphQLUserData {
  getUserData: UserData;
}
export interface GraphQLUserStarred {
  getUserInfoStarred: { starred: number[] };
}
export interface GraphQLUserInfoData {
  getUserInfoData: UserInfoData;
}
export interface GraphQLSeenData {
  getSeen: SeenData;
}
export interface GraphQLWatchUsersData {
  getWatchUsers: WatchUsersData;
}
export interface GraphQLSearchesData {
  getSearches: SearchesData[];
}
export interface StaticState {
  StarRanking: StarRankingData;
  SuggestedRepo: SuggestedData;
  SuggestedRepoImages: SuggestedDataImages;
}
export interface RenderImages {
  id: number;
  value: string[];
}
export interface RepoRenderImages {
  renderImages: RenderImages[];
}
export interface SearchUser {
  users: { [x: string]: any };
}
export interface IContext {
  state: IState;
  dispatch: Dispatch<IAction<any>>;
}
export interface IContextStargazers {
  stateStargazers: IStateStargazers;
  dispatchStargazers: Dispatch<IAction<any>>;
}

type ButtonType = 'submit' | 'reset' | 'button';
type AriaBoolean = boolean | 'true' | 'false';

/**
 * React.Ref uses the readonly type `React.RefObject` instead of
 * `React.MutableRefObject`, We pretty much always assume ref objects are
 * mutable (at least when we create them), so this type is a workaround so some
 * of the weird mechanics of using refs with TS.
 */
export type AssignableRef<ValueType> =
  | {
      bivarianceHack(instance: ValueType | null): void;
    }['bivarianceHack']
  | MutableRefObject<ValueType | null>;

export interface GetTogglePropsOutput {
  disabled: boolean;
  type: ButtonType;
  role: string;
  id: string;
  'aria-controls': string;
  'aria-expanded': AriaBoolean;
  tabIndex: number;
  onClick: (e: MouseEvent) => void;
}

export interface GetTogglePropsInput {
  [key: string]: unknown;
  disabled?: boolean;
  onClick?: (e: MouseEvent) => void;
}

export interface GetCollapsePropsOutput {
  id: string;
  onTransitionEnd: (e: TransitionEvent) => void;
  style: CSSProperties;
  'aria-hidden': AriaBoolean;
}

export interface GetCollapsePropsInput {
  [key: string]: unknown;
  style?: CSSProperties;
  onTransitionEnd?: (e: TransitionEvent) => void;
  refKey?: string;
  ref?: (node: ReactNode) => void | null | undefined;
}

export interface UseCollapseInput {
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  collapsedHeight?: number;
  expandStyles?: Record<string, any>;
  collapseStyles?: Record<string, any>;
  easing?: string;
  duration?: number;
  onCollapseStart?: () => void;
  onCollapseEnd?: () => void;
  onExpandStart?: () => void;
  onExpandEnd?: () => void;
}

export interface UseCollapseOutput {
  getCollapseProps: (config?: GetCollapsePropsInput) => GetCollapsePropsOutput;
  getToggleProps: (config?: GetTogglePropsInput) => GetTogglePropsOutput;
  isExpanded: boolean;
  setExpanded: any;
}

export type NullOrUndefined = null | undefined;

export type Maybe<T> = T | NullOrUndefined;
export interface CancelablePromiseType<T> {
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): CancelablePromiseType<TResult1 | TResult2>;

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
  ): CancelablePromiseType<T | TResult>;

  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null, runWhenCanceled?: boolean): CancelablePromiseType<T>;

  cancel(): void;

  isCanceled(): boolean;
}
export interface CancelablePromiseConstructor {
  /**
   * Creates a new Promise.
   * @param executor A callback used to initialize the promise. This callback is passed two arguments:
   * a resolve callback used to resolve the promise with a value or the result of another promise,
   * and a reject callback used to reject the promise with a provided reason or error.
   */
  new <T1>(executor: CancelablePromiseExecutor<T1>): CancelablePromiseType<T1>;
  <T1>(executor: CancelablePromiseExecutor<T1>): CancelablePromiseType<T1>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  all<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
    values: readonly [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>,
      T6 | PromiseLike<T6>,
      T7 | PromiseLike<T7>,
      T8 | PromiseLike<T8>,
      T9 | PromiseLike<T9>,
      T10 | PromiseLike<T10>
    ]
  ): CancelablePromiseType<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  all<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    values: readonly [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>,
      T6 | PromiseLike<T6>,
      T7 | PromiseLike<T7>,
      T8 | PromiseLike<T8>,
      T9 | PromiseLike<T9>
    ]
  ): CancelablePromiseType<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  all<T1, T2, T3, T4, T5, T6, T7, T8>(
    values: readonly [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>,
      T6 | PromiseLike<T6>,
      T7 | PromiseLike<T7>,
      T8 | PromiseLike<T8>
    ]
  ): CancelablePromiseType<[T1, T2, T3, T4, T5, T6, T7, T8]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  all<T1, T2, T3, T4, T5, T6, T7>(
    values: readonly [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>,
      T6 | PromiseLike<T6>,
      T7 | PromiseLike<T7>
    ]
  ): CancelablePromiseType<[T1, T2, T3, T4, T5, T6, T7]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  all<T1, T2, T3, T4, T5, T6>(
    values: readonly [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>,
      T6 | PromiseLike<T6>
    ]
  ): CancelablePromiseType<[T1, T2, T3, T4, T5, T6]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  all<T1, T2, T3, T4, T5>(
    values: readonly [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>
    ]
  ): CancelablePromiseType<[T1, T2, T3, T4, T5]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  all<T1, T2, T3, T4>(
    values: readonly [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>]
  ): CancelablePromiseType<[T1, T2, T3, T4]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  all<T1, T2, T3>(
    values: readonly [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]
  ): CancelablePromiseType<[T1, T2, T3]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  all<T1, T2>(values: readonly [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): CancelablePromiseType<[T1, T2]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  all<T1>(values: readonly (T1 | PromiseLike<T1>)[]): CancelablePromiseType<T1[]>;

  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
   * or rejected.
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  race<T1>(values: readonly T1[]): CancelablePromiseType<T1 extends PromiseLike<infer U> ? U : T1>;

  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
   * or rejected.
   * @param values An iterable of Promises.
   * @returns A new Promise.
   */
  race<T1>(values: Iterable<T1>): CancelablePromiseType<T1 extends PromiseLike<infer U> ? U : T1>;

  /**
   * Creates a new rejected promise for the provided reason.
   * @param reason The reason the promise was rejected.
   * @returns A new rejected Promise.
   */
  reject<T1 = never>(reason?: any): CancelablePromiseType<T1>;

  /**
   * Creates a new resolved promise for the provided value.
   * @param value A promise.
   * @returns A promise whose internal state matches the provided promise.
   */
  resolve<T1>(value: T1 | PromiseLike<T1>): CancelablePromiseType<T1>;

  /**
   * Creates a new resolved promise .
   * @returns A resolved promise.
   */
  resolve(): CancelablePromiseType<void>;

  /**
   * Creates a Promise that is resolved with an array of results when all
   * of the provided Promises resolve or reject.
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  allSettled<T1 extends readonly unknown[] | readonly [unknown]>(
    values: T1
  ): CancelablePromiseType<
    {
      -readonly [P in keyof T1]: PromiseSettledResult<T1[P] extends PromiseLike<infer U> ? U : T1[P]>;
    }
  >;

  /**
   * Creates a Promise that is resolved with an array of results when all
   * of the provided Promises resolve or reject.
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  allSettled<T1>(
    values: Iterable<T1>
  ): CancelablePromiseType<PromiseSettledResult<T1 extends PromiseLike<infer U> ? U : T1>[]>;
}
export function cancelable<T>(promise: PromiseLike<T>): CancelablePromiseType<T>;
export const CancelablePromise: CancelablePromiseConstructor;
