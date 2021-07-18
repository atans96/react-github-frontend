import { IStateDiscover } from '../../typing/interface';
import uniqBy from 'lodash.uniqby';
import { createStore } from '../../util/hooksy';
import { MergedDataProps } from '../../typing/type';
import { deepEqual } from 'fast-equals';

export type ActionDiscover =
  | 'LAST_PAGE_DISCOVER'
  | 'QUERY_USERNAME'
  | 'MERGED_DATA_APPEND_DISCOVER'
  | 'MERGED_DATA_ADDED_DISCOVER'
  | 'PER_PAGE'
  | 'ADVANCE_PAGE_DISCOVER'
  | 'VISIBLE'
  | 'REMOVE_ALL'
  | 'MERGED_DATA_APPEND_DISCOVER_EMPTY';

export const initialStateDiscover: IStateDiscover = {
  mergedDataDiscover: [],
  filterMergedDataDiscover: [],
  isLoadingDiscover: false,
  pageDiscover: 1,
  lastPageDiscover: 0,
  visibleDiscover: false,
  notificationDiscover: '',
};
const [getMergedDataDiscover, setMergedDataDiscover] = createStore<MergedDataProps[]>(
  initialStateDiscover.mergedDataDiscover
);
const [getFilterMergedDataDiscover, setFilterMergedDataDiscover] = createStore<MergedDataProps[]>(
  initialStateDiscover.filterMergedDataDiscover
);
const [getIsLoadingDiscover, setIsLoadingDiscover] = createStore<boolean>(initialStateDiscover.isLoadingDiscover);
const [getPageDiscover, setPageDiscover] = createStore<number>(initialStateDiscover.pageDiscover);
const [getLastPageDiscover, setLastPageDiscover] = createStore<number>(initialStateDiscover.lastPageDiscover);
const [getVisibleDiscover, setVisibleDiscover] = createStore<boolean>(initialStateDiscover.visibleDiscover);
const [getNotificationDiscover, setNotificationDiscover] = createStore<string>(
  initialStateDiscover.notificationDiscover
);

export const DiscoverStore = {
  store() {
    return {
      MergedDataDiscover: () => {
        const [mergedDataDiscover] = getMergedDataDiscover({
          shouldUpdate(oldData, newData) {
            return deepEqual(oldData, newData);
          },
        });
        return { mergedDataDiscover } as { mergedDataDiscover: MergedDataProps[] };
      },
      FilterMergedDataDiscover: () => {
        const [filterMergedDataDiscover] = getFilterMergedDataDiscover({
          shouldUpdate(oldData, newData) {
            return deepEqual(oldData, newData);
          },
        });
        return {
          filterMergedDataDiscover,
        } as { filterMergedDataDiscover: MergedDataProps[] };
      },
      IsLoadingDiscover: () => {
        const [isLoadingDiscover] = getIsLoadingDiscover({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { isLoadingDiscover } as { isLoadingDiscover: boolean };
      },
      PageDiscover: () => {
        const [pageDiscover] = getPageDiscover({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { pageDiscover } as { pageDiscover: number };
      },
      LastPageDiscover: () => {
        const [lastPageDiscover] = getLastPageDiscover({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { lastPageDiscover } as { lastPageDiscover: number };
      },
      VisibleDiscover: () => {
        const [visibleDiscover] = getVisibleDiscover({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { visibleDiscover } as { visibleDiscover: boolean };
      },
      NotificationDiscover: () => {
        const [notificationDiscover] = getNotificationDiscover({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { notificationDiscover } as { notificationDiscover: string };
      },
    };
  },
  dispatch({ type, payload }: { type: ActionDiscover; payload?: any }) {
    switch (type) {
      case 'VISIBLE': {
        setVisibleDiscover(payload.visibleDiscover);
        break;
      }
      case 'LAST_PAGE_DISCOVER': {
        setLastPageDiscover(payload.lastPageDiscover);
        break;
      }
      case 'MERGED_DATA_APPEND_DISCOVER_EMPTY': {
        setMergedDataDiscover([]);
        setPageDiscover(1);
        break;
      }
      case 'MERGED_DATA_APPEND_DISCOVER': {
        const { mergedDataDiscover } = this.store().MergedDataDiscover();
        setMergedDataDiscover(uniqBy([...mergedDataDiscover, ...payload.data], 'id'));
        break;
      }
      case 'MERGED_DATA_ADDED_DISCOVER': {
        setFilterMergedDataDiscover(payload.data);
        setIsLoadingDiscover(payload.isLoadingDiscover);
        setNotificationDiscover(payload.notificationDiscover);
        break;
      }
      case 'ADVANCE_PAGE_DISCOVER': {
        const { pageDiscover } = this.store().PageDiscover();
        setPageDiscover(pageDiscover + 1);
        break;
      }
    }
  },
};
