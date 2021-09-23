import { ActionResolvePromise, IDataOne } from '../typing/interface';
import { fastFilter, useStableCallback } from '../util';
import { Clicked, LanguagePreference, MergedDataProps, SeenProps } from '../typing/type';
import { filterActionResolvedPromiseData, noop } from '../util/util';
import React, { useEffect, useState } from 'react';
import { useTrackedState, useTrackedStateDiscover, useTrackedStateShared } from '../selectors/stateContextSelector';
import { useIsFetchFinish, useIsLoading, useNotification } from '../components/Home';
import { parallel } from 'async';
import { useLazyQuery } from '@apollo/client';
import { GET_CLICKED, GET_SEEN, GET_USER_STARRED } from '../graphql/queries';
import { useDexieDB } from '../db/db.ctx';
import { useLocation } from 'react-router-dom';

let getSeenRef = false;
let getClickedRef = false;
let getUserInfoStarredRef = false;
const useActionResolvePromise = () => {
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

  const [db] = useDexieDB();

  const [, setNotification] = useNotification();
  const [, setIsFetchFinish] = useIsFetchFinish();
  const [, setIsLoading] = useIsLoading();
  const location = useLocation();

  const [data, setData] = useState();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [, dispatchDiscover] = useTrackedStateDiscover();
  const [state, dispatch] = useTrackedState();
  const languagePreference = React.useMemo(() => {
    return new Map(
      (stateShared?.userData?.languagePreference &&
        stateShared.userData.languagePreference.map((obj: LanguagePreference) => [obj.language, obj])) ||
        []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateShared?.userData?.languagePreference]);

  const actionAppend = (data: IDataOne | any) => {
    if (state.filterBySeen) {
      return new Promise(function (resolve, reject) {
        switch (location.pathname) {
          case '/discover': {
            let filter1 = fastFilter(
              (obj: MergedDataProps) =>
                filterActionResolvedPromiseData(
                  obj,
                  !stateShared?.seenCards?.includes(obj.id) &&
                    !stateShared?.starred?.includes(obj.full_name) &&
                    !stateShared?.clicked?.find((element: Clicked) => element.full_name === obj.full_name),
                  !!languagePreference?.get(obj.language)?.checked
                ),
              data
            );
            if (filter1.length > 0) {
              dispatchDiscover({
                type: 'MERGED_DATA_APPEND_DISCOVER',
                payload: {
                  data: filter1,
                },
              });
            } else if (filter1.length === 0) {
              dispatchDiscover({
                type: 'ADVANCE_PAGE_DISCOVER',
              });
            }
            resolve();
            break;
          }
          default: {
            const filter1 = fastFilter(
              (obj: MergedDataProps) =>
                filterActionResolvedPromiseData(
                  obj,
                  !stateShared?.seenCards?.includes(obj.id) &&
                    !stateShared?.clicked?.find((element: Clicked) => element.full_name === obj.full_name),
                  !!languagePreference?.get(obj.language)
                ),
              data.dataOne
            );
            dispatch({
              type: 'MERGED_DATA_APPEND',
              payload: {
                data: filter1,
              },
            });
            if (filter1.length === 0) {
              dispatch({
                type: 'ADVANCE_PAGE',
              });
            } else {
              const temp = data.dataOne || data;
              temp.map((obj: MergedDataProps) => {
                obj['isQueue'] = false;
                return obj;
              });
              dispatch({
                type: 'MERGED_DATA_APPEND',
                payload: {
                  data: temp,
                },
              });
            }
            resolve();
            break;
          }
        }
      });
    }
  };

  useEffect(() => {
    let isFinished = false;
    if (!isFinished && !seenDataLoading && !seenDataError && seenData?.getSeen?.seenCards?.length > 0 && data) {
      parallel(
        [
          () =>
            dispatchShared({
              type: 'SET_SEEN',
              payload: {
                seenCards: seenData?.getSeen?.seenCards?.reduce((acc: any[], obj: SeenProps) => {
                  acc.push(obj.id);
                  return acc;
                }, []),
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
        ],
        () => {
          if (data) {
            actionAppend(data)!.then(noop);
          }
        }
      );
    } else if (!seenDataLoading && !seenDataError && seenData?.getSeen?.seenCards?.length > 0 && data) {
      actionAppend(data)!.then(noop);
    }
    return () => {
      isFinished = true;
    };
  }, [seenDataLoading, seenDataError, data]);

  useEffect(() => {
    let isFinished = false;
    if (!isFinished && !clickedLoading && !clickedError && clicked?.getClicked?.clicked?.length > 0 && data) {
      parallel(
        [
          () =>
            dispatchShared({
              type: 'SET_CLICKED',
              payload: {
                starred: clicked.getClicked.clicked,
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
        ],
        () => {
          if (data) {
            actionAppend(data)!.then(noop);
          }
        }
      );
    } else if (!clickedLoading && !clickedError && clicked?.getClicked?.clicked?.length === 0 && data) {
      actionAppend(data)!.then(noop);
    }
    return () => {
      isFinished = true;
    };
  }, [clickedLoading, clickedError, data]);

  useEffect(() => {
    let isFinished = false;
    if (
      !isFinished &&
      !loadingUserStarred &&
      !errorUserStarred &&
      userStarred?.getUserInfoStarred?.starred?.length > 0 &&
      data
    ) {
      parallel(
        [
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
        ],
        () => {
          if (data) {
            actionAppend(data)!.then(noop);
          }
        }
      );
    } else if (
      !loadingUserStarred &&
      !errorUserStarred &&
      userStarred?.getUserInfoStarred?.starred?.length === 0 &&
      data
    ) {
      actionAppend(data)!.then(noop);
    }
    return () => {
      isFinished = true;
    };
  }, [loadingUserStarred, errorUserStarred, data]);

  const actionResolvePromise = useStableCallback(
    ({ action, username, data = undefined, displayName, error = undefined }: ActionResolvePromise) => {
      if (data && action === 'append') {
        if (getSeenRef && getClickedRef && getUserInfoStarredRef) {
          actionAppend(data)!.then(noop);
          return;
        }
        if (!stateShared.isLoggedIn) {
          actionAppend(data)!.then(noop);
          return;
        }
        setData(data);
        setIsLoading({ isLoading: false });
        if (!getSeenRef) {
          getSeenRef = true; //mark as queried
          db?.getSeen.get(1).then((data: any) => {
            if (data && data?.data) {
              const temp = JSON.parse(data.data).getSeen;
              if (temp.seenCards.length > 0) {
                parallel([
                  () =>
                    dispatchShared({
                      type: 'SET_SEEN',
                      payload: {
                        seenCards: temp.seenCards.reduce((acc: any[], obj: SeenProps) => {
                          acc.push(obj.id);
                          return acc;
                        }, []),
                      },
                    }),
                  () =>
                    dispatch({
                      type: 'UNDISPLAY_MERGED_DATA',
                      payload: {
                        undisplayMergedData: temp.seenCards,
                      },
                    }),
                ]);
              }
            } else {
              getSeen();
            }
          });
        }
        if (!getClickedRef) {
          getClickedRef = true; //mark as queried
          db?.getClicked.get(1).then((data: any) => {
            if (data && data?.data) {
              const temp = JSON.parse(data.data).getClicked;
              if (temp.clicked.length > 0) {
                dispatchShared({
                  type: 'SET_CLICKED',
                  payload: {
                    clicked: temp.clicked,
                  },
                });
              }
            } else {
              getClicked();
            }
          });
        }
        if (!getUserInfoStarredRef) {
          getUserInfoStarredRef = true; //mark as queried
          db?.getUserInfoStarred.get(1).then((data: any) => {
            if (data && data?.data) {
              const temp = JSON.parse(data.data).getUserInfoStarred;
              if (temp.starred.length > 0) {
                dispatchShared({
                  type: 'SET_STARRED',
                  payload: {
                    starred: temp.starred,
                  },
                });
              }
            } else {
              getUserInfoStarred();
            }
          });
        }
      }
      if (action === 'noData') {
        setIsLoading({ isLoading: false });
        setIsFetchFinish({ isFetchFinish: true });
        if (username.length > 2) {
          setNotification({ notification: 'Sorry, no more data found' });
        } else {
          setNotification({ notification: `Sorry, no more data found for: "${username[0]}"` });
        }
      }
      if (action === 'end') {
        setIsLoading({ isLoading: false });
        setIsFetchFinish({ isFetchFinish: true });
        if (username.length > 2) {
          setNotification({ notification: "That's all the data we get" });
        } else {
          setNotification({ notification: `That's all the data we get for: "${username[0]}"` });
        }
      }
      if (action === 'error' && error) {
        setIsLoading({ isLoading: false });
        throw new Error(`Something wrong at ${displayName} ${error}`);
      }
      if (data && data.error_404) {
        setIsLoading({ isLoading: false });
        setNotification({ notification: `Sorry, no data found for ${username}` });
      } else if (data && data.error_403) {
        setIsLoading({ isLoading: false });
        setIsFetchFinish({ isFetchFinish: true });
        setNotification({ notification: 'Sorry, API rate limit exceeded.' });
      } else if (data && data.error_message) {
        setIsLoading({ isLoading: false });
        setIsFetchFinish({ isFetchFinish: true });
        setNotification({ notification: `${data.error_message}` });
      }
    }
  );
  return { actionResolvePromise };
};
export default useActionResolvePromise;
