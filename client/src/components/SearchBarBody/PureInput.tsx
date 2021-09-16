import React, { useEffect, useRef } from 'react';
import { getSearchUsers } from '../../services';
import { Then } from '../../util/react-if/Then';
import { If } from '../../util/react-if/If';
import { map, detect, parallel } from 'async';
import { StargazerProps } from '../../typing/type';
import { useLocation } from 'react-router-dom';
import { useTrackedState, useTrackedStateStargazers } from '../../selectors/stateContextSelector';
import Loadable from 'react-loadable';
import Empty from '../Layout/EmptyLayout';
import { useDebouncedValue } from '../../util/util';
import { useQueryUsername, useVisible, useVisibleSearchesHistory } from '../SearchBar';

const MultiValueSearch = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "MultiValueSearch" */ './PureInputBody/MultiValueSearch'),
});

interface SearchBarProps {
  style: React.CSSProperties;
  handleChange: any;
}

// separate setState from SearchBar so that SearchBar won't get rerender by onChange.
const PureInput: React.FC<SearchBarProps> = ({ handleChange, style }) => {
  const [, setVisible] = useVisible();
  const [username, setUsername] = useQueryUsername();
  const [visibleSearchesHistory, setVisibleSearchesHistory] = useVisibleSearchesHistory();

  const abortController = new AbortController();
  const [state, dispatch] = useTrackedState();
  const [stateStargazers, dispatchStargazers] = useTrackedStateStargazers();
  const isInputFocused = useRef<HTMLInputElement>(null);
  const debouncedValue = useDebouncedValue(username, 1500); // this value will pick real time value, but will change it's result only when it's seattled for 500ms

  useEffect(() => {
    let isFinished = false;
    if (username.toString().trim().length > 0 && !isFinished && debouncedValue) {
      parallel([
        () => setVisible(true),
        () =>
          dispatch({
            type: 'VISIBLE',
            payload: {
              visible: true,
            },
          }),
        () =>
          dispatch({
            type: 'LOADING',
            payload: {
              isLoading: true,
            },
          }),
        () =>
          getSearchUsers({ query: username.toString().trim(), signal: abortController.signal }).then((data) => {
            if (abortController.signal.aborted) {
              return;
            }
            const getUsers = data.items.reduce((acc: any, item: any) => {
              const result = Object.assign({}, { [item.login]: item.avatar_url });
              acc.push(result);
              return acc;
            }, []);
            if (getUsers) {
              dispatch({
                type: 'SEARCH_USERS',
                payload: {
                  data: getUsers,
                },
              });
              dispatch({
                type: 'LOADING',
                payload: {
                  isLoading: false,
                },
              });
            }
          }),
        () => setVisible(true),
        () =>
          dispatch({
            type: 'VISIBLE',
            payload: {
              visible: true,
            },
          }),
      ]);
    }
    return () => {
      isFinished = true;
    };
  }, [debouncedValue]);

  useEffect(() => {
    return () => {
      abortController.abort();
    };
  }, []);

  const onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.persist();
    parallel([
      () => handleChange(e.currentTarget.value),
      () => setUsername(e.currentTarget.value),
      () => {
        if (!visibleSearchesHistory) {
          setVisibleSearchesHistory(true);
        }
      },
      () => {
        if (!state.visible) {
          dispatch({
            type: 'VISIBLE',
            payload: {
              visible: true,
            },
          });
        }
      },
    ]);
  };
  const handleKey = (e: any) => {
    if (
      e.keyCode === 8 &&
      username.length === 0 &&
      stateStargazers.stargazersQueueData.length > 0 &&
      document.activeElement === isInputFocused.current
    ) {
      handleDeleteBackspace();
    }
  };

  const location = useLocation();

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/' && !isFinished) {
      // Bind the event listener
      document.addEventListener('keydown', handleKey);
    }
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('keydown', handleKey);
      isFinished = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleKey]);

  const handleDeleteBackspace = () => {
    const stargazer = stateStargazers.stargazersQueueData.slice(-1)[0];
    detect(
      stateStargazers.stargazersData,
      (obj: StargazerProps, cb) => {
        if (obj.id === stargazer.id) {
          // @ts-ignore
          cb(null, obj);
          return obj;
        }
      },
      (err, updatedStargazersData) => {
        if (err) {
          throw new Error('err');
        }
        if (updatedStargazersData !== undefined) {
          try {
            updatedStargazersData.isQueue = !updatedStargazersData.isQueue;
          } catch {
            updatedStargazersData['isQueue'] = false;
          }
          parallel([
            () =>
              map(
                stateStargazers.stargazersData,
                (obj: StargazerProps) => {
                  if (obj.id === updatedStargazersData.id) {
                    return updatedStargazersData;
                  } else {
                    return obj;
                  }
                },
                (err, result) => {
                  if (err) {
                    throw new Error('err');
                  }
                  return dispatchStargazers({
                    type: 'STARGAZERS_UPDATED',
                    payload: {
                      stargazersData: result,
                    },
                  });
                }
              ),
            () =>
              dispatchStargazers({
                type: 'SET_QUEUE_STARGAZERS',
                payload: {
                  stargazersQueueData: stargazer,
                },
              }),
          ]);
        } else {
          stargazer.isQueue = false;
          parallel([
            () =>
              dispatchStargazers({
                type: 'STARGAZERS_ADDED_WITHOUT_FILTER',
                payload: {
                  stargazersData: stargazer,
                },
              }),
            () =>
              dispatchStargazers({
                type: 'SET_QUEUE_STARGAZERS',
                payload: {
                  stargazersQueueData: stargazer,
                },
              }),
          ]);
        }
      }
    );
  };
  return (
    <div className={'input-bar-container-control-searchbar'} style={style}>
      <If condition={stateStargazers.stargazersQueueData.length > 0}>
        <Then>
          {stateStargazers.stargazersQueueData.map((obj: StargazerProps, idx) => (
            <MultiValueSearch key={idx} stargazer={obj} />
          ))}
        </Then>
      </If>
      <div style={{ display: 'inline-block' }}>
        <input
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          value={username}
          onChange={onInputChange}
          disabled={!state.filterBySeen}
          ref={isInputFocused}
          onBlur={() => setUsername('')}
          style={
            username.length > 0 || stateStargazers.stargazersQueueData.length > 0
              ? { width: `${65 + username.length * 2}px`, cursor: !state.filterBySeen ? 'not-allowed' : '' }
              : { width: style.width, cursor: !state.filterBySeen ? 'not-allowed' : '' }
          }
          type="text"
          className="input-multi"
          name="query"
          placeholder={'Search...'}
          title={state.filterBySeen ? 'Search github username or organization' : 'Please disable the Eye button first!'}
          required={stateStargazers.stargazersQueueData.length <= 0}
        />
      </div>
    </div>
  );
};
PureInput.displayName = 'PureInput';
export default PureInput;
