import { IAction, IState } from '../../typing/interface';
import { compareMaps, fastFilter } from '../../util';
import uniqBy from 'lodash.uniqby';
import { CardEnhancement, ImagesDataProps, MergedDataProps, SeenProps, TopicsProps } from '../../typing/type';
import { createStore } from '../../util/hooksy';
import { deepEqual, shallowEqual } from 'fast-equals';

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
  | 'SHOULD_IMAGES_DATA_ADDED'
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
  shouldFetchImages: false,
};
const [getUndisplayMergedData, setUndisplayMergedData] = createStore<SeenProps[]>(initialState.undisplayMergedData);
const [getMergedData, setMergedData] = createStore<MergedDataProps[]>(initialState.mergedData);
const [getRepoStat, setRepoStat] = createStore<string[]>(initialState.repoStat);
const [getFilteredMergedData, setFilteredMergedData] = createStore<MergedDataProps[]>(initialState.filteredMergedData);
const [getCardEnhancement, setCardEnhancement] = createStore<Map<number, CardEnhancement>>(
  initialState.cardEnhancement
);
const [getFilterBySeen, setFilterBySeen] = createStore<boolean>(initialState.filterBySeen);
const [getFilteredTopics, setFilteredTopics] = createStore<string[]>(initialState.filteredTopics);
const [getTopics, setTopics] = createStore<TopicsProps[]>(initialState.topics);
const [getImagesData, setImagesData] = createStore<ImagesDataProps[]>(initialState.imagesData);
const [getImagesMapData, setImagesMapData] = createStore<Map<number, any>>(initialState.imagesMapData);
const [getSearchUsers, setSearchUsers] = createStore<Array<{ [x: string]: string }>>(initialState.searchUsers);
const [getVisible, setVisible] = createStore<boolean>(initialState.visible);
const [getIsLoading, setIsLoading] = createStore<boolean>(initialState.isLoading);
const [getPage, setPage] = createStore<number>(initialState.page);
const [getLastPage, setLastPage] = createStore<number>(initialState.lastPage);
const [getShouldFetchImages, setShouldFetchImages] = createStore<boolean>(initialState.shouldFetchImages);

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
    case 'SHOULD_IMAGES_DATA_ADDED': {
      return {
        ...state,
        shouldFetchImages: action.payload.shouldFetchImages,
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
export const HomeStore = {
  initialState() {
    return initialState;
  },
  store() {
    return {
      UndisplayMergedData: () => {
        const [undisplayMergedData] = getUndisplayMergedData({
          shouldUpdate(oldData, newData) {
            return deepEqual(oldData, newData);
          },
        });
        return { undisplayMergedData } as { undisplayMergedData: SeenProps[] };
      },
      MergedData: () => {
        const [mergedData] = getMergedData({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { mergedData } as { mergedData: MergedDataProps[] };
      },
      RepoStat: () => {
        const [repoStat] = getRepoStat({
          shouldUpdate(oldData, newData) {
            return oldData.join() === newData.join();
          },
        });
        return { repoStat } as { repoStat: string[] };
      },
      FilteredMergedData: () => {
        const [filteredMergedData] = getFilteredMergedData({
          shouldUpdate(oldData, newData) {
            return deepEqual(oldData, newData);
          },
        });
        return { filteredMergedData } as { filteredMergedData: MergedDataProps[] };
      },
      CardEnhancement: () => {
        const [cardEnhancement] = getCardEnhancement({
          shouldUpdate(oldData, newData) {
            return compareMaps(oldData, newData);
          },
        });
        return { cardEnhancement } as { cardEnhancement: Map<number, CardEnhancement> };
      },
      FilterBySeen: () => {
        const [filterBySeen] = getFilterBySeen({
          shouldUpdate(oldData, newData) {
            return oldData === newData;
          },
        });
        return { filterBySeen } as { filterBySeen: boolean };
      },
      FilteredTopics: () => {
        const [filteredTopics] = getFilteredTopics({
          shouldUpdate(oldData, newData) {
            return oldData.join() === newData.join();
          },
        });
        return { filteredTopics } as { filteredTopics: string[] };
      },
      Topics: () => {
        const [topics] = getTopics({
          shouldUpdate(oldData, newData) {
            return shallowEqual(oldData, newData);
          },
        });
        return { topics } as { topics: TopicsProps[] };
      },
      ImagesData: () => {
        const [imagesData] = getImagesData({
          shouldUpdate(oldData, newData) {
            return deepEqual(oldData, newData);
          },
        });
        return { imagesData } as { imagesData: ImagesDataProps[] };
      },
      ImagesMapData: () => {
        const [imagesMapData] = getImagesMapData({
          shouldUpdate(oldData, newData) {
            return compareMaps(oldData, newData);
          },
        });
        return { imagesMapData } as { imagesMapData: Map<number, any> };
      },
      SearchUsers: () => {
        const [searchUsers] = getSearchUsers({
          shouldUpdate(oldData, newData) {
            return oldData.join() === newData.join();
          },
        });
        return { searchUsers } as { searchUsers: Array<{ [x: string]: string }> };
      },
      Visible: () => {
        const [visible] = getVisible({
          shouldUpdate(oldData, newData) {
            return oldData === newData;
          },
        });
        return { visible } as { visible: boolean };
      },
      IsLoading: () => {
        const [isLoading] = getIsLoading({
          shouldUpdate(oldData, newData) {
            return oldData === newData;
          },
        });
        return { isLoading } as { isLoading: boolean };
      },
      Page: () => {
        const [page] = getPage({
          shouldUpdate(oldData, newData) {
            return oldData === newData;
          },
        });
        return { page } as { page: number };
      },
      LastPage: () => {
        const [lastPage] = getLastPage({
          shouldUpdate(oldData, newData) {
            return oldData === newData;
          },
        });
        return { lastPage } as { lastPage: number };
      },
      ShouldFetchImages: () => {
        const [shouldFetchImages] = getShouldFetchImages({
          shouldUpdate(oldData, newData) {
            return oldData === newData;
          },
        });
        return { shouldFetchImages } as { shouldFetchImages: boolean };
      },
    };
  },
  dispatch({ type, payload }: { type: Action; payload?: any }) {
    switch (type) {
      //TODO: instead of blindly comparing each object at Component level, use metadata to tell object comparer to compare specific state
      // that contains mutation
      case 'REPO_STAT': {
        setRepoStat(payload.repoStat);
        break;
      }
      case 'SET_CARD_ENHANCEMENT': {
        //TODO: is there a better solution for detecting change partially for dispatcher rather than copying a whole array that's expensive?
        //https://stackoverflow.com/questions/56795743/how-to-convert-map-to-array-of-object
        let { cardEnhancement } = this.store().CardEnhancement();
        cardEnhancement = cardEnhancement.set(payload.cardEnhancement.id, payload.cardEnhancement);
        setCardEnhancement(new Map([...Array.from(cardEnhancement)]));
        break;
      }
      case 'UNDISPLAY_MERGED_DATA': {
        setUndisplayMergedData(payload.undisplayMergedData);
        break;
      }
      case 'FILTER_CARDS_BY_SEEN': {
        setFilterBySeen(payload.filterBySeen);
        break;
      }
      case 'SHOULD_IMAGES_DATA_ADDED': {
        setShouldFetchImages(payload.shouldFetchImages);
        break;
      }
      case 'FILTER_SET_TOPICS_REMOVE': {
        const { filteredTopics } = this.store().FilteredTopics();
        setFilteredTopics(fastFilter((obj: any) => obj !== payload.filteredTopics, filteredTopics));
        break;
      }
      case 'FILTER_SET_TOPICS': {
        const { filteredTopics } = this.store().FilteredTopics();
        setFilteredTopics([...filteredTopics, payload.filteredTopics]);
        break;
      }
      case 'MERGED_DATA_FILTER_BY_TAGS': {
        setFilteredMergedData(payload.filteredMergedData);
        break;
      }
      case 'SET_TOPICS': {
        setTopics(payload.topics);
        break;
      }
      case 'SET_TOPICS_APPEND': {
        const { topics } = this.store().Topics();
        setTopics(
          Object.values(
            [...topics, ...payload.topics].reduce((acc, { topic, count, clicked }) => {
              acc[topic] = { topic, clicked, count: (acc[topic] ? acc[topic].count : 0) + count };
              return acc;
            }, {})
          )
        );
        break;
      }
      case 'REMOVE_ALL': {
        setTopics([]);
        setImagesData([]);
        setImagesMapData(new Map<number, any>());
        setMergedData([]);
        setSearchUsers([]);
        setFilteredMergedData([]);
        setFilteredTopics([]);
        setPage(1);
        setLastPage(0);
        setVisible(false);
        setFilterBySeen(true);
        break;
      }
      case 'LAST_PAGE': {
        setLastPage(payload.lastPage);
        break;
      }
      case 'LOADING': {
        setIsLoading(payload.isLoading);
        break;
      }
      case 'VISIBLE': {
        setVisible(payload.visible);
        break;
      }
      case 'SEARCH_USERS': {
        setSearchUsers(payload.data);
        break;
      }
      case 'MERGED_DATA_APPEND': {
        const { mergedData } = this.store().MergedData();
        setMergedData(uniqBy([...mergedData, ...payload.data], 'id'));
        break;
      }
      case 'MERGED_DATA_ADDED': {
        setMergedData(payload.data);
        break;
      }
      case 'IMAGES_DATA_ADDED': {
        const { imagesData } = this.store().ImagesData();
        setImagesData(uniqBy([...imagesData, ...payload.images], 'id'));
        setImagesMapData(new Map(uniqBy([...imagesData, ...payload.images], 'id').map((obj) => [obj.id, obj])));
        break;
      }
      case 'IMAGES_DATA_REPLACE': {
        setImagesData(payload.imagesData);
        setImagesMapData(payload.imagesData.map((obj: any) => [obj.id, obj]));
        break;
      }
      case 'ADVANCE_PAGE': {
        const { page } = this.store().Page();
        setPage(page + 1);
        break;
      }
    }
  },
};
