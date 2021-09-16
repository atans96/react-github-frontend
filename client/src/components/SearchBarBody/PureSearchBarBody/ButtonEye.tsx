import React, { useEffect, useRef, useState } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { createTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { useTrackedState, useTrackedStateShared } from '../../../selectors/stateContextSelector';
import { SeenProps } from '../../../typing/type';
import { If } from '../../../util/react-if/If';
import { Then } from '../../../util/react-if/Then';
import { ShouldRender } from '../../../typing/enum';
import { parallel } from 'async';
import { GET_SEEN } from '../../../graphql/queries';
import { useApolloClient, useLazyQuery } from '@apollo/client';
import { useDexieDB } from '../../../db/db.ctx';

const defaultTheme = createTheme();
const theme = createTheme({
  overrides: {
    MuiTooltip: {
      tooltip: {
        fontSize: '16px',
      },
    },
  },
});

interface ButtonEyeProps {
  showTipsText: any;
}

const ButtonEye: React.FC<ButtonEyeProps> = ({ showTipsText }) => {
  const [getSeen, { data: seenData, loading: seenDataLoading, error: seenDataError }] = useLazyQuery(GET_SEEN, {
    context: { clientName: 'mongo' },
  });
  const client = useApolloClient();
  const [db] = useDexieDB();
  const [state, dispatch] = useTrackedState();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [clicked, setClicked] = useState(false);
  const handleClickFilterSeenCards = (event: React.MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    if (!clicked) {
      dispatch({
        type: 'FILTER_CARDS_BY_SEEN',
        payload: {
          filterBySeen: !state.filterBySeen,
        },
      });
      db.getSeen.get(1).then((data: any) => {
        if (data) {
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
              () => {
                if (stateShared.shouldRender === ShouldRender.Home) {
                  dispatchShared({
                    type: 'SET_SHOULD_RENDER',
                    payload: {
                      shouldRender: '',
                    },
                  });
                } else {
                  dispatchShared({
                    type: 'SET_SHOULD_RENDER',
                    payload: {
                      shouldRender: ShouldRender.Home,
                    },
                  });
                }
              },
            ]);
          }
        } else {
          getSeen();
        }
      });
    } else {
      dispatchShared({
        type: 'SET_SEEN',
        payload: {
          seenCards: [],
        },
      });
      dispatch({
        type: 'MERGED_DATA_ADDED',
        payload: {
          data: [],
        },
      });
      dispatch({
        type: 'FILTER_CARDS_BY_SEEN',
        payload: {
          filterBySeen: !state.filterBySeen,
        },
      });
      dispatch({
        type: 'UNDISPLAY_MERGED_DATA',
        payload: {
          undisplayMergedData: [],
        },
      });
      dispatchShared({
        type: 'SET_SHOULD_RENDER',
        payload: {
          shouldRender: !state.filterBySeen ? '' : 'home',
        },
      });
    }
    if (!clicked) {
      setClicked((prev) => {
        return !prev;
      });
    }
  };
  useEffect(() => {
    let isFinished = false;
    if (!isFinished && !seenDataLoading && !seenDataError && seenData?.getSeen?.seenCards?.length > 0) {
      parallel([
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
          client.cache.writeQuery({
            query: GET_SEEN,
            data: {
              getSeen: {
                seenCards: seenData?.getSeen?.seenCards,
              },
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
    } else if (!isFinished && !seenDataLoading && !seenDataError && seenData?.getSeen?.seenCards?.length === 0) {
      dispatch({
        type: 'MERGED_DATA_ADDED',
        payload: {
          data: [],
        },
      });
      dispatchShared({
        type: 'SET_SHOULD_RENDER',
        payload: {
          shouldRender: 'home',
        },
      });
    }
    return () => {
      isFinished = true;
    };
  }, [seenDataLoading, seenDataError, seenData?.getSeen?.seenCards]);
  return (
    <React.Fragment>
      <MuiThemeProvider theme={defaultTheme}>
        <MuiThemeProvider theme={theme}>
          <If condition={stateShared.isLoggedIn}>
            <Then>
              <Tooltip title={showTipsText(`${state.filterBySeen ? 'noFilterSeen' : 'filterSeen'}`)}>
                <div onClick={handleClickFilterSeenCards} className="btn" style={{ cursor: 'pointer' }}>
                  <span className={`glyphicon ${state.filterBySeen ? 'glyphicon-eye-close' : 'glyphicon-eye-open'}`} />
                </div>
              </Tooltip>
            </Then>
          </If>
          <If condition={!stateShared.isLoggedIn}>
            <Then>
              <Tooltip title={showTipsText(`login`)}>
                <div className="btn" style={{ cursor: 'not-allowed', opacity: 0.6 }}>
                  <span className={`glyphicon ${state.filterBySeen ? 'glyphicon-eye-close' : 'glyphicon-eye-open'}`} />
                </div>
              </Tooltip>
            </Then>
          </If>
        </MuiThemeProvider>
      </MuiThemeProvider>
    </React.Fragment>
  );
};
ButtonEye.displayName = 'ButtonEye';
export default ButtonEye;
