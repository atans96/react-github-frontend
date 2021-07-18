import { IStateShared } from '../../typing/interface';
import { initialState } from '../Home/reducer';
import { initialStateDiscover } from '../Discover/reducer';
import { initialStateStargazers } from '../Staargazers/reducer';
import { compareMaps } from '../../util';
import { initialStateManageProfile } from '../ManageProfile/reducer';
import { initialStateRateLimit } from '../RateLimit/reducer';
import { GithubLanguages } from '../../typing/type';
import { createStore } from '../../util/hooksy';

export type ActionShared =
  | 'TOKEN_ADDED'
  | 'LOGIN'
  | 'PER_PAGE'
  | 'LOGOUT'
  | 'SET_GITHUB_LANGUAGES'
  | 'SET_WIDTH'
  | 'QUERY_USERNAME'
  | 'SET_USERNAME'
  | 'TOKEN_RSS_ADDED'
  | 'SET_SHOULD_RENDER'
  | 'SET_DRAWER_WIDTH'
  | 'SET_CARD_ENHANCEMENT'
  | 'NO_DATA_FETCH';
export const initialStateShared: IStateShared = {
  width: window.innerWidth,
  shouldRender: '',
  githubLanguages: new Map<string, GithubLanguages>(),
  perPage: parseInt(localStorage.getItem('perPage')!) || 10, //setting
  tokenRSS: '', //setting
  tokenGQL: '', //setting
  isLoggedIn: false,
  fetchDataPath: '',
  username: '',
  queryUsername: [], //multiple username or queue
  drawerWidth: 0, //persist drawer width once it's dragged and moved by the user
};
const [getStoreisLoggedIn, setIsLoggedIn] = createStore<boolean>(initialStateShared.isLoggedIn);
const [getStoreWidth, setWidth] = createStore<number>(initialStateShared.width);
const [getShouldRender, setShouldRender] = createStore<string>(initialStateShared.shouldRender);
const [getGithubLanguages, setGithubLanguages] = createStore<Map<string, GithubLanguages>>(
  initialStateShared.githubLanguages
);
const [getPerPage, setPerPage] = createStore<number>(initialStateShared.perPage);
const [getTokenRSS, setTokenRSS] = createStore<string>(initialStateShared.tokenRSS);
const [getTokenGQL, setTokenGQL] = createStore<string>(initialStateShared.tokenGQL);
const [getFetchDataPath, setFetchDataPath] = createStore<string>(initialStateShared.fetchDataPath);
const [getUsername, setUsername] = createStore<string>(initialStateShared.username);
const [getQueryUsername, setQueryUsername] = createStore<string | string[]>(initialStateShared.queryUsername);
const [getDrawerWidth, setDrawerWidth] = createStore<number>(initialStateShared.drawerWidth);
export const SharedStore = {
  store() {
    return {
      Width: () => {
        const [width] = getStoreWidth({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { width } as { width: number };
      },
      ShouldRender: () => {
        const [shouldRender] = getShouldRender({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { shouldRender } as { shouldRender: string };
      },
      GithubLanguages: () => {
        const [githubLanguages] = getGithubLanguages({
          shouldUpdate(oldData, newData) {
            return compareMaps(oldData, newData);
          },
        });
        return { githubLanguages } as {
          githubLanguages: Map<string, GithubLanguages>;
          setGithubLanguages: any;
        };
      },
      PerPage: () => {
        const [perPage] = getPerPage({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { perPage } as { perPage: number };
      },
      TokenRSS: () => {
        const [tokenRSS] = getTokenRSS({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { tokenRSS } as { tokenRSS: string };
      },
      TokenGQL: () => {
        const [tokenGQL] = getTokenGQL({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { tokenGQL } as { tokenGQL: string };
      },
      IsLoggedIn: () => {
        const [isLoggedIn] = getStoreisLoggedIn({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { isLoggedIn } as { isLoggedIn: boolean };
      },
      FetchDataPath: () => {
        const [fetchDataPath] = getFetchDataPath({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { fetchDataPath } as { fetchDataPath: string };
      },
      Username: () => {
        const [username] = getUsername({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { username } as { username: string };
      },
      QueryUsername: () => {
        const [queryUsername] = getQueryUsername({
          shouldUpdate(oldData, newData) {
            if (Array.isArray(oldData) && Array.isArray(newData)) return oldData.join() === newData.join();
            return oldData !== newData;
          },
        });
        return { queryUsername } as { queryUsername: string[] | string };
      },
      DrawerWidth: () => {
        const [drawerWidth] = getDrawerWidth({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { drawerWidth } as { drawerWidth: number };
      },
    };
  },
  dispatch({ type, payload }: { type: ActionShared; payload?: any }) {
    switch (type) {
      case 'LOGOUT': {
        localStorage.clear();
        return {
          ...initialStateShared,
          ...initialState,
          ...initialStateDiscover,
          ...initialStateStargazers,
          ...initialStateManageProfile,
          ...initialStateRateLimit,
        };
      }
      case 'SET_SHOULD_RENDER': {
        setShouldRender(payload.shouldRender);
        break;
      }
      case 'SET_USERNAME': {
        setUsername(payload.username);
        break;
      }
      case 'SET_GITHUB_LANGUAGES': {
        setGithubLanguages(new Map(payload.githubLanguages.map((obj: GithubLanguages) => [obj.language, obj])));
        break;
      }
      case 'SET_DRAWER_WIDTH': {
        setDrawerWidth(payload.drawerWidth);
        break;
      }
      case 'NO_DATA_FETCH': {
        setFetchDataPath(payload.path);
        break;
      }
      case 'TOKEN_RSS_ADDED': {
        setTokenRSS(payload.tokenRSS);
        break;
      }
      case 'PER_PAGE': {
        setPerPage(payload.perPage);
        break;
      }
      case 'QUERY_USERNAME': {
        setQueryUsername(payload.queryUsername);
        break;
      }
      case 'TOKEN_ADDED': {
        setTokenGQL(payload.tokenGQL);
        break;
      }
      case 'LOGIN': {
        setIsLoggedIn(payload.isLoggedIn);
        break;
      }
      case 'SET_WIDTH': {
        setWidth(payload.width);
        break;
      }
    }
  },
};
