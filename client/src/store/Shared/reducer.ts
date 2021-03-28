import { IAction, IStateShared } from '../../typing/interface';
import { initialState } from '../reducer';
import { initialStateDiscover } from '../Discover/reducer';
import { initialStateStargazers } from '../Staargazers/reducer';
import { readEnvironmentVariable } from '../../util';
import { initialStateManageProfile } from '../ManageProfile/reducer';
import { initialStateRateLimit } from '../RateLimit/reducer';

export type ActionShared =
  | 'TOKEN_ADDED'
  | 'LOGIN'
  | 'PER_PAGE'
  | 'LOGOUT'
  | 'SET_WIDTH'
  | 'USERNAME_ADDED'
  | 'SET_DRAWER_WIDTH'
  | 'TOKEN_RSS_ADDED'
  | 'NO_DATA_FETCH';

export const initialStateShared: IStateShared = {
  width: 0,
  perPage: parseInt(localStorage.getItem('perPage')!) || 10, //setting
  tokenRSS: '', //setting
  tokenGQL: '', //setting
  isLoggedIn: false,
  fetchDataPath: '',
  username: [], //multiple username or queue
  drawerWidth: 0, //persist drawer width once it's dragged and moved by the user
  client_id: readEnvironmentVariable('CLIENT_ID'), //setting
  redirect_uri: readEnvironmentVariable('REDIRECT_URI'), //setting
  client_secret: readEnvironmentVariable('CLIENT_SECRET'), //setting
  proxy_url: readEnvironmentVariable('PROXY_URL')!, //setting
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
    case 'NO_DATA_FETCH': {
      return {
        ...state,
        fetchDataPath: action.payload.path,
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
    case 'USERNAME_ADDED': {
      return {
        ...state,
        username: action.payload.username,
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
