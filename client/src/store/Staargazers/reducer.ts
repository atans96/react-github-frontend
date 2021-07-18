import { IStateStargazers } from '../../typing/interface';
import { HasNextPage, StargazerProps } from '../../typing/type';
import { fastFilter } from '../../util';
import uniqBy from 'lodash.uniqby';
import { createStore } from '../../util/hooksy';
import { deepEqual, shallowEqual } from 'fast-equals';

export type ActionStargazers =
  | 'STARGAZERS_ADDED'
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
const [getlanguage, setlanguage] = createStore<string>(initialStateStargazers.language);
const [getStargazersData, setStargazersData] = createStore<StargazerProps[]>(initialStateStargazers.stargazersData);
const [getHasNextPage, setHasNextPage] = createStore<HasNextPage>(initialStateStargazers.hasNextPage);
const [getStargazersQueueData, setStargazersQueueData] = createStore<StargazerProps[]>(
  initialStateStargazers.stargazersQueueData
);
const [getStargazersUsers, setStargazersUsers] = createStore<number>(initialStateStargazers.stargazersUsers);
const [getStargazersUsersStarredRepositories, setStargazersUsersStarredRepositories] = createStore<number>(
  initialStateStargazers.stargazersUsersStarredRepositories
);
export const StargazersStore = {
  store() {
    return {
      Language: () => {
        const [language] = getlanguage({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { language } as { language: string };
      },
      StargazersData: () => {
        const [stargazersData] = getStargazersData({
          shouldUpdate(oldData, newData) {
            return deepEqual(oldData, newData);
          },
        });
        return { stargazersData } as { stargazersData: StargazerProps[] };
      },
      HasNextPage: () => {
        const [hasNextPage] = getHasNextPage({
          shouldUpdate(oldData, newData) {
            return shallowEqual(oldData, newData);
          },
        });
        return { hasNextPage } as { hasNextPage: HasNextPage };
      },
      StargazersQueueData: () => {
        const [stargazersQueueData] = getStargazersQueueData({
          shouldUpdate(oldData, newData) {
            return deepEqual(oldData, newData);
          },
        });
        return { stargazersQueueData } as { stargazersQueueData: StargazerProps[] };
      },
      StargazersUsers: () => {
        const [stargazersUsers] = getStargazersUsers({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { stargazersUsers } as { stargazersUsers: number };
      },
      StargazersUsersStarredRepositories: () => {
        const [stargazersUsersStarredRepositories] = getStargazersUsersStarredRepositories({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return {
          stargazersUsersStarredRepositories,
        } as { stargazersUsersStarredRepositories: number };
      },
    };
  },
  dispatch({ type, payload }: { type: ActionStargazers; payload?: any }) {
    switch (type) {
      case 'REMOVE_ALL': {
        setStargazersData([]);
        setHasNextPage({} as HasNextPage);
        break;
      }
      case 'REMOVE_QUEUE': {
        setStargazersQueueData([]);
        break;
      }
      case 'STARGAZERS_UPDATED': {
        setStargazersData(payload.stargazersData);
        break;
      }
      case 'SET_QUEUE_STARGAZERS': {
        const { stargazersQueueData } = this.store().StargazersQueueData();
        setStargazersQueueData(
          stargazersQueueData.find((obj) => payload.stargazersQueueData.id === obj.id)
            ? fastFilter((obj: StargazerProps) => obj.id !== payload.stargazersQueueData.id, stargazersQueueData)
            : uniqBy([...stargazersQueueData, payload.stargazersQueueData], 'id')
        );
        break;
      }
      case 'STARGAZERS_ADDED': {
        const { stargazersQueueData } = this.store().StargazersQueueData();
        const { stargazersData } = this.store().StargazersData();
        const temp = uniqBy([...stargazersData, payload.stargazersData], 'id');
        setStargazersData(
          fastFilter((obj: any) => stargazersQueueData.findIndex((xx) => xx.id === obj.id) === -1, temp)
        );
        break;
      }
      case 'STARGAZERS_ADDED_WITHOUT_FILTER': {
        const { stargazersData } = this.store().StargazersData();
        setStargazersData(uniqBy([...stargazersData, payload.stargazersData], 'id'));
        break;
      }
      case 'STARGAZERS_USERS': {
        setStargazersUsers(payload.stargazersUsers);
        break;
      }
      case 'STARGAZERS_USERS_REPOS': {
        setStargazersUsersStarredRepositories(payload.stargazersUsersStarredRepositories);
        break;
      }
      case 'STARGAZERS_HAS_NEXT_PAGE': {
        setHasNextPage(payload.hasNextPage);
        break;
      }
      case 'SET_LANGUAGE': {
        setlanguage(payload.language);
        break;
      }
    }
  },
};
