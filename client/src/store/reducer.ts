import { IAction, IState, IStateStargazers } from '../typing/interface';
import { HasNextPage } from '../typing/type';
import { fastFilter, readEnvironmentVariable } from '../util';

const _ = require('lodash');
type Action =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LAST_PAGE'
  | 'LAST_PAGE_DISCOVER'
  | 'LOADING'
  | 'VISIBLE'
  | 'SEARCH_USERS'
  | 'USERNAME_ADDED'
  | 'MERGED_DATA_APPEND'
  | 'MERGED_DATA_APPEND_DISCOVER'
  | 'MERGED_DATA_ADDED'
  | 'IMAGES_DATA_ADDED'
  | 'IMAGES_DATA_ADDED_DISCOVER'
  | 'IMAGES_DATA_REPLACE'
  | 'PER_PAGE'
  | 'ADVANCE_PAGE'
  | 'ADVANCE_PAGE_DISCOVER'
  | 'TOKEN_RSS_ADDED'
  | 'STARGAZERS_ADDED'
  | 'CONTRIBUTORS_ADDED'
  | 'STARGAZERS_SORTED_LANGUAGE'
  | 'STARGAZERS_USERS'
  | 'STARGAZERS_USERS_REPOS'
  | 'STARGAZERS_HAS_NEXT_PAGE'
  | 'SORTING_DATA_ADDED'
  | 'FILTER_CARDS_BY_SEEN'
  | 'REPO_INFO_ADDED'
  | 'RATE_LIMIT'
  | 'SET_WIDTH'
  | 'RATE_LIMIT_ADDED'
  | 'TOKEN_ADDED'
  | 'SET_TOPICS'
  | 'SET_TOPICS_APPEND'
  | 'FILTER_SET_TOPICS'
  | 'FILTER_SET_TOPICS_REMOVE'
  | 'MERGED_DATA_FILTER_BY_TAGS'
  | 'REMOVE_ALL'
  | 'SET_DRAWER_WIDTH'
  | 'SET_LANGUAGE'
  | 'STARGAZERS_UPDATED'
  | 'STARGAZERS_ADDED_WITHOUT_FILTER'
  | 'SET_QUEUE_STARGAZERS'
  | 'SHOULD_IMAGES_DATA_ADDED'
  | 'REMOVE_QUEUE'
  | 'UNDISPLAY_MERGED_DATA'
  | 'RATE_LIMIT_GQL';

export const initialStateStargazers: IStateStargazers = {
  language: localStorage.getItem('language')! || 'JavaScript', //setting
  stargazersData: [], // graphql request
  hasNextPage: {} as HasNextPage, // graphql request
  stargazersQueueData: [],
  stargazersUsers: parseInt(localStorage.getItem('users')!) || 2, //setting
  stargazersUsersStarredRepositories: parseInt(localStorage.getItem('repos')!) || 2, //setting
};
export const reducerStargazers = (state = initialStateStargazers, action: IAction<Action>): IStateStargazers => {
  switch (action.type) {
    case 'LOGOUT': {
      localStorage.clear();
      return {
        ...state,
        stargazersData: [],
        hasNextPage: {} as HasNextPage,
        stargazersQueueData: [],
      };
    }
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
          ? fastFilter((obj: any) => obj.id !== action.payload.stargazersQueueData.id, state.stargazersQueueData)
          : _.uniqBy([...state.stargazersQueueData, action.payload.stargazersQueueData], 'id'),
      };
    }
    case 'STARGAZERS_UPDATED': {
      return {
        ...state,
        stargazersData: action.payload.stargazersData,
      };
    }
    case 'STARGAZERS_ADDED': {
      const temp = _.uniqBy([...state.stargazersData, action.payload.stargazersData], 'id');
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
        stargazersData: _.uniqBy([...state.stargazersData, action.payload.stargazersData], 'id'),
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
export const initialState: IState = {
  // localStorage.getItem() can return either a string or null
  isLoggedIn: false,
  client_id: readEnvironmentVariable('CLIENT_ID'), //setting
  redirect_uri: readEnvironmentVariable('REDIRECT_URI'), //setting
  client_secret: readEnvironmentVariable('CLIENT_SECRET'), //setting
  proxy_url: readEnvironmentVariable('PROXY_URL')!, //setting
  rateLimit: {},
  rateLimitGQL: {},
  contributors: [],
  repoInfo: [],
  rateLimitAnimationAdded: false,
  width: 0,
  mergedDataDiscover: [],
  undisplayMergedData: [],
  mergedData: [],
  filteredMergedData: [],
  filterBySeen: true,
  filteredTopics: [],
  topics: [],
  imagesData: [],
  imagesDataDiscover: [],
  searchUsers: [], // for autocomplete function
  visible: false,
  isLoading: false,
  page: 1,
  pageDiscover: 1,
  perPage: parseInt(localStorage.getItem('perPage')!) || 10, //setting
  username: [], //multiple username or queue
  tokenRSS: '', //setting
  tokenGQL: '', //setting
  lastPage: 0,
  lastPageDiscover: 0,
  drawerWidth: 0, //persist drawer width once it's dragged and moved by the user
  shouldFetchImages: false,
};
export const reducer = (state = initialState, action: IAction<Action>): IState => {
  switch (action.type) {
    case 'REPO_INFO_ADDED': {
      return {
        ...state,
        repoInfo: action.payload.repoInfo,
      };
    }
    case 'CONTRIBUTORS_ADDED': {
      return {
        ...state,
        contributors: action.payload.contributors,
      };
    }
    case 'TOKEN_ADDED': {
      return {
        ...state,
        tokenGQL: action.payload.tokenGQL,
      };
    }
    case 'UNDISPLAY_MERGED_DATA': {
      return {
        ...state,
        undisplayMergedData: action.payload.undisplayMergedData,
      };
    }
    case 'FILTER_CARDS_BY_SEEN': {
      return {
        ...state,
        filterBySeen: action.payload.filterBySeen,
      };
    }
    case 'LOGIN': {
      return {
        ...state,
        isLoggedIn: action.payload.isLoggedIn,
      };
    }
    case 'LOGOUT': {
      localStorage.clear();
      return {
        ...state,
        isLoggedIn: false,
        filteredMergedData: [],
        filteredTopics: [],
        mergedDataDiscover: [],
        rateLimit: {},
        rateLimitGQL: {},
        rateLimitAnimationAdded: false,
        mergedData: [],
        imagesData: [],
        imagesDataDiscover: [],
        searchUsers: [], // for autocomplete function
        visible: false,
        isLoading: false,
        page: 1,
        pageDiscover: 1,
        lastPage: 0,
        lastPageDiscover: 0,
        undisplayMergedData: [],
      };
    }
    case 'SHOULD_IMAGES_DATA_ADDED': {
      return {
        ...state,
        shouldFetchImages: action.payload.shouldFetchImages,
      };
    }
    case 'SET_DRAWER_WIDTH': {
      return {
        ...state,
        drawerWidth: action.payload.drawerWidth,
      };
    }
    case 'FILTER_SET_TOPICS_REMOVE': {
      return {
        ...state,
        filteredTopics: fastFilter((obj: any) => obj !== action.payload.filteredTopics, state.filteredTopics),
      };
    }
    case 'FILTER_SET_TOPICS': {
      return {
        ...state,
        filteredTopics: [...state.filteredTopics, action.payload.filteredTopics],
      };
    }
    case 'MERGED_DATA_FILTER_BY_TAGS': {
      return {
        ...state,
        filteredMergedData: action.payload.filteredMergedData,
      };
    }
    case 'SET_WIDTH': {
      return {
        ...state,
        width: action.payload.width,
      };
    }
    case 'SET_TOPICS': {
      return {
        ...state,
        topics: action.payload.topics,
      };
    }
    case 'SET_TOPICS_APPEND': {
      return {
        ...state,
        topics: Object.values(
          [...state.topics, ...action.payload.topics].reduce((acc, { topic, count, clicked }) => {
            acc[topic] = { topic, clicked, count: (acc[topic] ? acc[topic].count : 0) + count };
            return acc;
          }, {})
        ),
      };
    }
    case 'REMOVE_ALL': {
      return {
        ...state,
        topics: [],
        imagesData: [],
        mergedData: [],
        searchUsers: [],
        filteredMergedData: [],
        filteredTopics: [],
        page: 1,
        lastPage: 0,
        visible: false,
        filterBySeen: true,
      };
    }
    case 'LAST_PAGE': {
      return {
        ...state,
        lastPage: action.payload.lastPage,
      };
    }
    case 'LAST_PAGE_DISCOVER': {
      return {
        ...state,
        lastPageDiscover: action.payload.lastPageDiscover,
      };
    }
    case 'LOADING': {
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };
    }
    case 'VISIBLE': {
      return {
        ...state,
        visible: action.payload.visible,
      };
    }
    case 'SEARCH_USERS': {
      return {
        ...state,
        searchUsers: action.payload.data,
      };
    }
    case 'USERNAME_ADDED': {
      return {
        ...state,
        username: action.payload.username,
      };
    }
    case 'MERGED_DATA_APPEND': {
      return {
        ...state,
        mergedData: _.uniqBy([...state.mergedData, ...action.payload.data], 'id'),
      };
    }
    case 'MERGED_DATA_APPEND_DISCOVER': {
      return {
        ...state,
        mergedDataDiscover: _.uniqBy([...state.mergedDataDiscover, ...action.payload.data], 'id'),
      };
    }
    case 'MERGED_DATA_ADDED': {
      return {
        ...state,
        mergedData: action.payload.data,
      };
    }
    case 'IMAGES_DATA_ADDED': {
      return {
        ...state,
        imagesData: _.uniqBy([...state.imagesData, ...action.payload.images], 'id'),
      };
    }
    case 'IMAGES_DATA_ADDED_DISCOVER': {
      return {
        ...state,
        imagesDataDiscover: _.uniqBy([...state.imagesDataDiscover, ...action.payload.images], 'id'),
      };
    }
    case 'IMAGES_DATA_REPLACE': {
      return {
        ...state,
        imagesData: action.payload.imagesData,
      };
    }
    case 'PER_PAGE': {
      return {
        ...state,
        perPage: action.payload.perPage,
      };
    }
    case 'ADVANCE_PAGE': {
      return {
        ...state,
        page: state.page + 1,
      };
    }
    case 'ADVANCE_PAGE_DISCOVER': {
      return {
        ...state,
        pageDiscover: state.pageDiscover + 1,
      };
    }
    case 'TOKEN_RSS_ADDED': {
      return {
        ...state,
        tokenRSS: action.payload.tokenRSS,
      };
    }
    case 'RATE_LIMIT': {
      return {
        ...state,
        rateLimit: {
          limit: action.payload.limit,
          used: action.payload.used,
          reset: action.payload.reset,
        },
      };
    }
    case 'RATE_LIMIT_ADDED': {
      return {
        ...state,
        rateLimitAnimationAdded: action.payload.rateLimitAnimationAdded,
      };
    }
    case 'RATE_LIMIT_GQL': {
      return {
        ...state,
        rateLimitGQL: {
          limit: action.payload.limit,
          used: action.payload.used,
          reset: action.payload.reset,
        },
      };
    }
    default:
      return state;
  }
};
