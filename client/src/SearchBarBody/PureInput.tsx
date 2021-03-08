import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { dispatchLoading, dispatchSearchUsers, dispatchVisible } from '../store/dispatcher';
import { getSearchUsers } from '../services';
import _ from 'lodash';
import { IState, IStateStargazers } from '../typing/interface';
import { Then } from '../util/react-if/Then';
import { If } from '../util/react-if/If';
import { Result } from './PureInputBody/Result';
import { StargazerProps } from '../typing/type';
import { useApolloFactorySelector } from '../selectors/stateSelector';

interface SearchBarProps {
  setVisible: any;
  stateStargazers: IStateStargazers;
  style: React.CSSProperties;
  dispatch: any;
  ref: any;
  dispatchStargazersUser: any;
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
    const { userData } = useApolloFactorySelector((query: any) => query.getUserData);
    const [username, setUsername] = useState('');
    const isInputFocused = useRef<HTMLInputElement>(null);
    const handler = useCallback(
      _.debounce(function (username) {
        if (username.toString().trim().length > 0) {
          setVisible(true); // show the autocomplete
          dispatchVisible(true, dispatch); // need this to set zIndex for Masonry Layout at Home.js

          // as you won't get to see the loading spinner when you first enter query to do autocomplete
          // since you need to wait API response to come before setting dispatchSearchUsers(data.users, true, dispatch); below
          dispatchLoading(true, dispatch);
          getSearchUsers(
            username.toString().trim(),
            userData && userData.getUserData ? userData.getUserData.token : ''
          ).then((data) => {
            dispatchSearchUsers(data.users, dispatch);
            dispatchLoading(false, dispatch);
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
        dispatchVisible(true, dispatch);
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
      // Bind the event listener
      document.addEventListener('keydown', handleKey);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener('keydown', handleKey);
      };
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
            {stateStargazers.stargazersQueueData.map((obj) => {
              return (
                <Result
                  stateStargazers={stateStargazers}
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
          />
        </div>
      </div>
    );
  }
);
