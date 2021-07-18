import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { getSearchUsers } from '../services';
import { Then } from '../util/react-if/Then';
import { If } from '../util/react-if/If';

import { StargazerProps } from '../typing/type';
import { useLocation } from 'react-router-dom';
import { useTrackedState, useTrackedStateStargazers } from '../selectors/stateContextSelector';
import Loadable from 'react-loadable';
import Empty from '../Layout/EmptyLayout';
import { useDebouncedValue } from '../util/util';

const MultiValueSearch = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "MultiValueSearch" */ './PureInputBody/MultiValueSearch'),
});
interface SearchBarProps {
  setVisible: any;
  style: React.CSSProperties;
  ref: any;
  handleChange: any;
  visibleSearchesHistory: any;
  setVisibleSearchesHistory: any;
}
// separate setState from SearchBar so that SearchBar won't get rerender by onChange
const PureInput: React.FC<SearchBarProps> = React.forwardRef(
  ({ visibleSearchesHistory, setVisibleSearchesHistory, setVisible, handleChange, style }, ref) => {
    const [state, dispatch] = useTrackedState();
    const [stateStargazers, dispatchStargazers] = useTrackedStateStargazers();
    const [username, setUsername] = useState('');
    const isInputFocused = useRef<HTMLInputElement>(null);
    const debouncedValue = useDebouncedValue(username, 1500); // this value will pick real time value, but will change it's result only when it's seattled for 500ms

    useEffect(() => {
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
        getSearchUsers(username.toString().trim()).then((data) => {
          if (data) {
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
          }
        });
      }
    }, [debouncedValue]);
    useImperativeHandle(
      ref,
      () => ({
        clearState() {
          setUsername('');
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
        return () => {
          // Unbind the event listener on clean up
          document.removeEventListener('keydown', handleKey);
          isFinished = true;
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
        dispatchStargazers({
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
        dispatchStargazers({
          type: 'SET_QUEUE_STARGAZERS',
          payload: {
            stargazersQueueData: stargazer,
          },
        });
      } else {
        stargazer.isQueue = false;
        dispatchStargazers({
          type: 'STARGAZERS_ADDED_WITHOUT_FILTER',
          payload: {
            stargazersData: stargazer,
          },
        });
        dispatchStargazers({
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
            ref={isInputFocused}
            onBlur={() => setUsername('')}
            style={
              username.length > 0 || stateStargazers.stargazersQueueData.length > 0
                ? { width: `${65 + username.length * 2}px` }
                : { width: style.width }
            }
            type="text"
            className="input-multi"
            name="query"
            placeholder={'Search...'}
            required={stateStargazers.stargazersQueueData.length <= 0}
          />
        </div>
      </div>
    );
  }
);
PureInput.displayName = 'PureInput';
export default PureInput;
