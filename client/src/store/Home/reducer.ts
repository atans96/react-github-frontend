import { IAction, IState } from '../../typing/interface';
import { fastFilter } from '../../util';
import uniqBy from 'lodash.uniqby';
import { CardEnhancement } from '../../typing/type';

export type Action =
  | 'LAST_PAGE'
  | 'LOADING'
  | 'REPO_STAT'
  | 'REMOVE_ALL'
  | 'VISIBLE'
  | 'SEARCH_USERS'
  | 'MERGED_DATA_APPEND'
  | 'MERGED_DATA_ADDED'
  | 'IMAGES_DATA_ADDED'
  | 'IMAGES_DATA_REPLACE'
  | 'ADVANCE_PAGE'
  | 'SORTING_DATA_ADDED'
  | 'FILTER_CARDS_BY_SEEN'
  | 'SET_TOPICS'
  | 'SET_TOPICS_APPEND'
  | 'FILTER_SET_TOPICS'
  | 'FILTER_SET_TOPICS_REMOVE'
  | 'MERGED_DATA_FILTER_BY_TAGS'
  | 'SET_CARD_ENHANCEMENT'
  | 'UNDISPLAY_MERGED_DATA';

export const initialState: IState = {
  // localStorage.getItem() can return either a string or null
  undisplayMergedData: [],
  mergedData: [],
  repoStat: [],
  filteredMergedData: [],
  cardEnhancement: new Map<number, CardEnhancement>(),
  filterBySeen: true,
  filteredTopics: [],
  topics: [],
  imagesData: [],
  imagesMapData: new Map<number, any>(),
  searchUsers: [], // for autocomplete function
  visible: false,
  isLoading: false,
  page: 1,
  lastPage: 0,
};
export const reducer = (state = initialState, action: IAction<Action>): IState => {
  switch (action.type) {
    //TODO: instead of blindly comparing each object at Component level, use metadata to tell object comparer to compare specific state
    // that contains mutation
    case 'REPO_STAT': {
      return {
        ...state,
        repoStat: action.payload.repoStat,
      };
    }
    case 'SET_CARD_ENHANCEMENT': {
      state.cardEnhancement = state.cardEnhancement.set(
        action.payload.cardEnhancement.id,
        action.payload.cardEnhancement
      );
      //TODO: is there a better solution for detecting change partially for dispatcher rather than copying a whole array that's expensive?
      //https://stackoverflow.com/questions/56795743/how-to-convert-map-to-array-of-object
      return {
        ...state,
        cardEnhancement: new Map([...Array.from(state.cardEnhancement)]), // if we only set state.cardEnhancement.set(action.payload), the dispatch won't get re-render since it's not a brand new object
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
        imagesMapData: new Map<number, any>(),
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
    case 'MERGED_DATA_APPEND': {
      return {
        ...state,
        mergedData: uniqBy([...state.mergedData, ...action.payload.data], 'id'),
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
        imagesData: uniqBy([...state.imagesData, ...action.payload.images], 'id'),
        imagesMapData: new Map(
          uniqBy([...state.imagesData, ...action.payload.images], 'id').map((obj) => [obj.id, obj])
        ),
      };
    }
    case 'IMAGES_DATA_REPLACE': {
      return {
        ...state,
        imagesData: action.payload.imagesData,
        imagesMapData: new Map(action.payload.imagesData.map((obj: any) => [obj.id, obj])),
      };
    }
    case 'ADVANCE_PAGE': {
      return {
        ...state,
        page: state.page + 1,
      };
    }
    default:
      return state;
  }
};
