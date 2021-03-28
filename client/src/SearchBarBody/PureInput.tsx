import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { getSearchUsers } from '../services';
import _ from 'lodash';
import { IAction, IState, IStateStargazers } from '../typing/interface';
import { Then } from '../util/react-if/Then';
import { If } from '../util/react-if/If';
import { Result } from './PureInputBody/Result';
import { StargazerProps } from '../typing/type';
import { useApolloFactory } from '../hooks/useApolloFactory';
import { Action } from '../store/Home/reducer';
import { ActionStargazers } from '../store/Staargazers/reducer';

interface SearchBarProps {
  setVisible: any;
  stateStargazers: IStateStargazers;
  style: React.CSSProperties;
  dispatchStargazersUser: React.Dispatch<IAction<ActionStargazers>>;
  dispatch: React.Dispatch<IAction<Action>>;
  ref: any;
  handleChange: any;
  visibleSearchesHistory: any;
  setVisibleSearchesHistory: any;
  state: IState;
}

// separate setState from SearchBar so that SearchBar won't get rerender by onChange
export const PureInput: React.FC<SearchBarProps> = React.forwardRef(
  (
    {
      visibleSearchesHistory,
      setVisibleSearchesHistory,
      setVisible,
      handleChange,
      stateStargazers,
      style,
      state,
      dispatch,
      dispatchStargazersUser,
    },
    ref
  ) => {
    const displayName: string | undefined = (PureInput as React.ComponentType<any>).displayName;
    const { userData } = useApolloFactory(displayName!).query.getUserData();
    const [username, setUsername] = useState('');
    const isInputFocused = useRef<HTMLInputElement>(null);
    const handler = useCallback(
      _.debounce(function (username) {
        if (username.toString().trim().length > 0) {
          setVisible(true); // show the autocomplete
          dispatch({
            type: 'VISIBLE',
            payload: {
              visible: true,
            },
          }); // need this to set zIndex for Masonry Layout at Home.js

          // as you won't get to see the loading spinner when you first enter query to do autocomplete
          // since you need to wait API response to come before setting dispatchSearchUsers(data.users, true, dispatch); below
          dispatch({
            type: 'LOADING',
            payload: {
              isLoading: true,
            },
          });
          getSearchUsers(
            username.toString().trim(),
            userData && userData.getUserData ? userData.getUserData.token : ''
          ).then((data) => {
            dispatch({
              type: 'SEARCH_USERS',
              payload: {
                data: data.users,
              },
            });
            dispatch({
              type: 'LOADING',
              payload: {
                isLoading: false,
              },
            });
          });
        }
      }, 1500),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );
    useImperativeHandle(
      ref,
      () => ({
        clearState() {
          setUsername('');
          handler('');
        },
        getState() {
          return username.trim();
        },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [setUsername, username]
    );
    const onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.persist();
      handleChange(e.currentTarget.value);
      setUsername(e.currentTarget.value);
      if (!visibleSearchesHistory) {
        setVisibleSearchesHistory(true);
      }
      if (!state.visible) {
        dispatch({
          type: 'VISIBLE',
          payload: {
            visible: true,
          },
        });
      }
      handler(e.currentTarget.value);
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
    useEffect(() => {
      if (document.location.pathname === '/') {
        // Bind the event listener
        document.addEventListener('keydown', handleKey);
        return () => {
          // Unbind the event listener on clean up
          document.removeEventListener('keydown', handleKey);
        };
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleKey]);
    const handleDeleteBackspace = () => {
      const stargazer = stateStargazers.stargazersQueueData.slice(-1)[0];
      const updatedStargazersData = stateStargazers.stargazersData.find(
        (obj: StargazerProps) => obj.id === stargazer.id
      );
      if (updatedStargazersData !== undefined) {
        try {
          updatedStargazersData.isQueue = !updatedStargazersData.isQueue;
        } catch {
          updatedStargazersData['isQueue'] = false;
        }
        dispatchStargazersUser({
          type: 'STARGAZERS_UPDATED',
          payload: {
            stargazersData: stateStargazers.stargazersData.map((obj: StargazerProps) => {
              if (obj.id === updatedStargazersData.id) {
                return updatedStargazersData;
              } else {
                return obj;
              }
            }),
          },
        });
        dispatchStargazersUser({
          type: 'SET_QUEUE_STARGAZERS',
          payload: {
            stargazersQueueData: stargazer,
          },
        });
      } else {
        stargazer.isQueue = false;
        dispatchStargazersUser({
          type: 'STARGAZERS_ADDED_WITHOUT_FILTER',
          payload: {
            stargazersData: stargazer,
          },
        });
        dispatchStargazersUser({
          type: 'SET_QUEUE_STARGAZERS',
          payload: {
            stargazersQueueData: stargazer,
          },
        });
      }
    };
    return (
      <div className={'input-bar-container-control-searchbar'} style={style}>
        <If condition={stateStargazers.stargazersQueueData.length > 0}>
          <Then>
            {stateStargazers.stargazersQueueData.map((obj: StargazerProps, idx) => {
              return (
                <Result
                  stateStargazers={stateStargazers}
                  key={idx}
                  dispatchStargazersUser={dispatchStargazersUser}
                  stargazer={obj}
                />
              );
            })}
          </Then>
        </If>
        <div style={{ display: 'inline-block' }}>
          <input
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            value={username}
            onChange={onInputChange}
            ref={isInputFocused}
            onBlur={() => {
              handler('');
              setUsername('');
            }}
            style={
              username.length > 0 || stateStargazers.stargazersQueueData.length > 0
                ? { width: `${65 + username.length * 2}px` }
                : { width: style.width }
            }
            type="text"
            className="input-multi"
            name="query"
            placeholder={'Search...'}
            required
          />
        </div>
      </div>
    );
  }
);
PureInput.displayName = 'PureInput';
