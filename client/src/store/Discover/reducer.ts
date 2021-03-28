import { IAction, IStateDiscover } from '../../typing/interface';

export type ActionDiscover =
  | 'LAST_PAGE_DISCOVER'
  | 'USERNAME_ADDED'
  | 'MERGED_DATA_APPEND_DISCOVER'
  | 'MERGED_DATA_ADDED_DISCOVER'
  | 'PER_PAGE'
  | 'ADVANCE_PAGE_DISCOVER'
  | 'VISIBLE'
  | 'REMOVE_ALL'
  | 'SET_DRAWER_WIDTH';

export const initialStateDiscover: IStateDiscover = {
  mergedDataDiscover: [],
  filterMergedDataDiscover: [],
  isLoadingDiscover: false,
  pageDiscover: 1,
  lastPageDiscover: 0,
  visibleDiscover: false,
  notificationDiscover: '',
};
export const reducerDiscover = (state = initialStateDiscover, action: IAction<ActionDiscover>): IStateDiscover => {
  switch (action.type) {
    case 'VISIBLE': {
      return {
        ...state,
        visibleDiscover: action.payload.visibleDiscover,
      };
    }
    case 'LAST_PAGE_DISCOVER': {
      return {
        ...state,
        lastPageDiscover: action.payload.lastPageDiscover,
      };
    }
    case 'MERGED_DATA_APPEND_DISCOVER': {
      return {
        ...state,
        mergedDataDiscover: action.payload.data,
      };
    }
    case 'MERGED_DATA_ADDED_DISCOVER': {
      return {
        ...state,
        filterMergedDataDiscover: action.payload.data,
        isLoadingDiscover: action.payload.isLoadingDiscover,
        notificationDiscover: action.payload.notificationDiscover,
      };
    }
    case 'ADVANCE_PAGE_DISCOVER': {
      return {
        ...state,
        pageDiscover: state.pageDiscover + 1,
      };
    }
    default:
      return state;
  }
};
