import { useCallback, useEffect, useRef } from 'react';
import { Clicked, GithubLanguages, SeenProps } from '../typing/type';
import { useLazyQuery } from '@apollo/client';
import { GET_CLICKED, GET_SEEN, GET_USER_STARRED } from '../graphql/queries';
import { parallel } from 'async';
import { useTrackedState, useTrackedStateShared } from '../selectors/stateContextSelector';
import { useDexieDB } from '../db/db.ctx';

const fetchDexieDB = ({ db, cb, cbLazy }: any) => {
  db?.get(1).then((data: any) => {
    if (data && data?.data) {
      cb(data.data);
    } else {
      cbLazy();
    }
  });
};
export const useFetchDB = (db: any) => {
  const isFinished = useRef(false);
  const [, dispatchShared] = useTrackedStateShared();
  const [, dispatch] = useTrackedState();
  const [getSeen, { data: seenData, loading: seenDataLoading, error: seenDataError }] = useLazyQuery(GET_SEEN, {
    context: { clientName: 'mongo' },
  });
  const [getClicked, { data: clicked, loading: clickedLoading, error: clickedError }] = useLazyQuery(GET_CLICKED, {
    context: { clientName: 'mongo' },
  });
  const [getUserInfoStarred, { data: userStarred, loading: loadingUserStarred, error: errorUserStarred }] =
    useLazyQuery(GET_USER_STARRED, {
      context: { clientName: 'mongo' },
    });
  const setFetchDB = useCallback(() => {
    fetchDexieDB({
      db: db?.getSeen,
      cb: (data: any) => {
        const temp = JSON.parse(data).getSeen;
        if (temp.seenCards.length > 0) {
          dispatchShared({
            type: 'SET_SEEN',
            payload: {
              seenCards: new Map(temp.seenCards.map((obj: SeenProps) => [obj.id, true]) || []),
            },
          });
          dispatch({
            type: 'UNDISPLAY_MERGED_DATA',
            payload: {
              undisplayMergedData: temp.seenCards,
            },
          });
        }
      },
      cbLazy: getSeen,
    });
    fetchDexieDB({
      db: db?.getClicked,
      cb: (data: any) => {
        const temp = JSON.parse(data).getClicked;
        if (temp.clicked.length > 0) {
          dispatchShared({
            type: 'SET_CLICKED',
            payload: {
              clicked: new Map(temp.clicked.map((acc: any[], obj: Clicked) => [obj.full_name, true]) || []),
            },
          });
        }
      },
      cbLazy: getClicked,
    });
    fetchDexieDB({
      db: db?.getUserInfoStarred,
      cb: (data: any) => {
        const temp = JSON.parse(data).getUserInfoStarred;
        if (temp.starred.length > 0) {
          dispatchShared({
            type: 'SET_STARRED',
            payload: {
              clicked: temp.starred,
            },
          });
        }
      },
      cbLazy: getUserInfoStarred,
    });
  }, [db]);
  useEffect(() => {
    if (!isFinished.current && !seenDataLoading && !seenDataError && seenData?.getSeen?.seenCards?.length > 0) {
      parallel([
        () =>
          dispatchShared({
            type: 'SET_SEEN',
            payload: {
              seenCards: new Map(seenData?.getSeen?.seenCards.map((obj: SeenProps) => [obj.id, true]) || []),
            },
          }),
        () =>
          dispatch({
            type: 'UNDISPLAY_MERGED_DATA',
            payload: {
              undisplayMergedData: seenData?.getSeen?.seenCards,
            },
          }),
        () =>
          db?.getSeen?.add(
            {
              data: JSON.stringify({
                getSeen: {
                  seenCards: seenData?.getSeen?.seenCards,
                },
              }),
            },
            1
          ),
      ]);
    }
  }, [seenDataLoading, seenDataError]);
  useEffect(() => {
    if (!isFinished.current && !clickedLoading && !clickedError && clicked?.getClicked?.clicked?.length > 0) {
      parallel([
        () =>
          dispatchShared({
            type: 'SET_CLICKED',
            payload: {
              starred: new Map(
                clicked.getClicked.clicked.map((acc: any[], obj: Clicked) => [obj.full_name, true]) || []
              ),
            },
          }),
        () =>
          db?.getClicked?.add(
            {
              data: JSON.stringify({
                getClicked: {
                  clicked: clicked.getClicked.clicked,
                },
              }),
            },
            1
          ),
      ]);
    }
  }, [clickedLoading, clickedError]);

  useEffect(() => {
    if (
      !isFinished.current &&
      !loadingUserStarred &&
      !errorUserStarred &&
      userStarred?.getUserInfoStarred?.starred?.length > 0
    ) {
      parallel([
        () =>
          dispatchShared({
            type: 'SET_STARRED',
            payload: {
              starred: userStarred.getUserInfoStarred.starred.map(
                (obj: { is_queried: boolean; full_name: string }) => obj.full_name
              ),
            },
          }),
        () =>
          db?.getUserInfoStarred?.add(
            {
              data: JSON.stringify({
                getUserInfoStarred: {
                  starred: userStarred.getUserInfoStarred.starred,
                },
              }),
            },
            1
          ),
      ]);
    }
  }, [loadingUserStarred, errorUserStarred]);
  useEffect(() => {
    return () => {
      isFinished.current = true;
    };
  }, []);
  return setFetchDB;
};
