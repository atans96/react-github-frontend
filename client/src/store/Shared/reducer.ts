import { IAction, IStateShared } from '../../typing/interface';
import { initialState } from '../Home/reducer';
import { initialStateDiscover } from '../Discover/reducer';
import { initialStateStargazers } from '../Staargazers/reducer';
import { readEnvironmentVariable } from '../../util';
import { initialStateManageProfile } from '../ManageProfile/reducer';
import { initialStateRateLimit } from '../RateLimit/reducer';
import { GithubLanguages } from '../../typing/type';

export type ActionShared =
  | 'TOKEN_ADDED'
  | 'LOGIN'
  | 'PER_PAGE'
  | 'LOGOUT'
  | 'SET_GITHUB_LANGUAGES'
  | 'SET_WIDTH'
  | 'SET_SEEN'
  | 'SET_CLICKED'
  | 'SET_SEARCHES_HISTORY'
  | 'SET_STARRED'
  | 'QUERY_USERNAME'
  | 'SET_USERDATA'
  | 'SET_USERNAME'
  | 'TOKEN_RSS_ADDED'
  | 'SET_SHOULD_RENDER'
  | 'SET_DRAWER_WIDTH'
  | 'SET_CARD_ENHANCEMENT';

export const initialStateShared: IStateShared = {
  width: window.innerWidth,
  shouldRender: '',
  seenCards: [],
  clicked: [],
  searches: [],
  userData: {},
  starred: [],
  githubLanguages: new Map<string, { obj: GithubLanguages; index: number }>(),
  perPage: parseInt(localStorage.getItem('perPage')!) || 10, //setting
  tokenRSS: '', //setting
  tokenGQL: '', //setting
  isLoggedIn: false,
  username: '',
  queryUsername: [], //multiple username or queue
  drawerWidth: 0, //persist drawer width once it's dragged and moved by the user
  client_id: readEnvironmentVariable('CLIENT_ID'), //setting
  redirect_uri: readEnvironmentVariable('REDIRECT_URI'), //setting
  client_secret: readEnvironmentVariable('CLIENT_SECRET'), //setting
  proxy_url: readEnvironmentVariable('UWEBSOCKET_ADDRESS_PROXY_URL')!, //setting
};
export const reducerShared = (state = initialStateShared, action: IAction<ActionShared>): IStateShared => {
  switch (action.type) {
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
    case 'SET_CLICKED': {
      return {
        ...state,
        clicked: action.payload.clicked,
      };
    }
    case 'SET_USERDATA': {
      return {
        ...state,
        userData: action.payload.userData,
      };
    }
    case 'SET_SEARCHES_HISTORY': {
      return {
        ...state,
        searches: action.payload.searches,
      };
    }
    case 'SET_STARRED': {
      return {
        ...state,
        starred: action.payload.starred,
      };
    }
    case 'SET_SEEN': {
      return {
        ...state,
        seenCards: action.payload.seenCards,
      };
    }
    case 'SET_SHOULD_RENDER': {
      return {
        ...state,
        shouldRender: action.payload.shouldRender,
      };
    }
    case 'SET_USERNAME': {
      return {
        ...state,
        username: action.payload.username,
      };
    }
    case 'SET_GITHUB_LANGUAGES': {
      return {
        ...state,
        githubLanguages: new Map(
          action.payload.githubLanguages.map((obj: GithubLanguages, index: number) => [obj.language, { obj, index }]) ||
            []
        ),
      };
    }
    case 'SET_DRAWER_WIDTH': {
      return {
        ...state,
        drawerWidth: action.payload.drawerWidth,
      };
    }
    case 'TOKEN_RSS_ADDED': {
      return {
        ...state,
        tokenRSS: action.payload.tokenRSS,
      };
    }
    case 'PER_PAGE': {
      return {
        ...state,
        perPage: action.payload.perPage,
      };
    }
    case 'QUERY_USERNAME': {
      return {
        ...state,
        queryUsername: action.payload.queryUsername,
      };
    }
    case 'TOKEN_ADDED': {
      return {
        ...state,
        tokenGQL: action.payload.tokenGQL,
      };
    }
    case 'LOGIN': {
      return {
        ...state,
        isLoggedIn: action.payload.isLoggedIn,
      };
    }
    case 'SET_WIDTH': {
      return {
        ...state,
        width: action.payload.width,
      };
    }
    default:
      return state;
  }
};
