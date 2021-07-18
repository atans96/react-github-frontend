import { IAction, IStateStargazers } from '../../typing/interface';
import { HasNextPage, StargazerProps } from '../../typing/type';
import { fastFilter } from '../../util';
import uniqBy from 'lodash.uniqby';
export type ActionStargazers =
  | 'STARGAZERS_ADDED'
  | 'STARGAZERS_SORTED_LANGUAGE'
  | 'STARGAZERS_USERS'
  | 'STARGAZERS_USERS_REPOS'
  | 'STARGAZERS_HAS_NEXT_PAGE'
  | 'REMOVE_ALL'
  | 'SET_LANGUAGE'
  | 'STARGAZERS_UPDATED'
  | 'STARGAZERS_ADDED_WITHOUT_FILTER'
  | 'SET_QUEUE_STARGAZERS'
  | 'REMOVE_QUEUE';
export const initialStateStargazers: IStateStargazers = {
  language: localStorage.getItem('language')! || 'JavaScript', //setting
  stargazersData: [], // graphql request
  hasNextPage: {} as HasNextPage, // graphql request
  stargazersQueueData: [],
  stargazersUsers: parseInt(localStorage.getItem('users')!) || 2, //setting
  stargazersUsersStarredRepositories: parseInt(localStorage.getItem('repos')!) || 2, //setting
};
export const reducerStargazers = (
  state = initialStateStargazers,
  action: IAction<ActionStargazers>
): IStateStargazers => {
  switch (action.type) {
    case 'REMOVE_ALL': {
      return {
        ...state,
        stargazersData: [],
        hasNextPage: {} as HasNextPage,
      };
    }
    case 'REMOVE_QUEUE': {
      return {
        ...state,
        stargazersQueueData: [],
      };
    }
    case 'STARGAZERS_SORTED_LANGUAGE': {
      return {
        ...state,
        stargazersData: action.payload.stargazersData,
      };
    }
    case 'SET_QUEUE_STARGAZERS': {
      return {
        ...state,
        stargazersQueueData: state.stargazersQueueData.find((obj) => action.payload.stargazersQueueData.id === obj.id)
          ? fastFilter(
              (obj: StargazerProps) => obj.id !== action.payload.stargazersQueueData.id,
              state.stargazersQueueData
            )
          : uniqBy([...state.stargazersQueueData, action.payload.stargazersQueueData], 'id'),
      };
    }
    case 'STARGAZERS_UPDATED': {
      return {
        ...state,
        stargazersData: action.payload.stargazersData,
      };
    }
    case 'STARGAZERS_ADDED': {
      const temp = uniqBy([...state.stargazersData, action.payload.stargazersData], 'id');
      return {
        ...state,
        stargazersData: fastFilter(
          (obj: any) => state.stargazersQueueData.findIndex((xx) => xx.id === obj.id) === -1,
          temp
        ),
      };
    }
    case 'STARGAZERS_ADDED_WITHOUT_FILTER': {
      return {
        ...state,
        stargazersData: uniqBy([...state.stargazersData, action.payload.stargazersData], 'id'),
      };
    }
    case 'STARGAZERS_USERS': {
      return {
        ...state,
        stargazersUsers: action.payload.stargazersUsers,
      };
    }
    case 'STARGAZERS_USERS_REPOS': {
      return {
        ...state,
        stargazersUsersStarredRepositories: action.payload.stargazersUsersStarredRepositories,
      };
    }
    case 'STARGAZERS_HAS_NEXT_PAGE': {
      return {
        ...state,
        hasNextPage: action.payload.hasNextPage,
      };
    }
    case 'SET_LANGUAGE': {
      return {
        ...state,
        language: action.payload.language,
      };
    }
    default:
      return state;
  }
};
