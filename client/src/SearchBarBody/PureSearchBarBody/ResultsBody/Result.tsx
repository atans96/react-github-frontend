import React, { createRef, useEffect, useState } from 'react';
import { useApolloFactory } from '../../../hooks/useApolloFactory';
import {
  useTrackedState,
  useTrackedStateShared,
  useTrackedStateStargazers,
} from '../../../selectors/stateContextSelector';
import { useQueryUsername, useVisible, useVisibleSearchesHistory } from '../../../SearchBar';
import { useStableCallback } from '../../../util';
import { ShouldRender } from '../../../typing/enum';
import { parallel } from 'async';

interface Result {
  userName: string;
  getRootProps: any;
  children(): React.ReactNode;
}

const Result: React.FC<Result> = ({ children, userName, getRootProps }) => {
  const [, setVisible] = useVisible();
  const [, setVisibleSearchesHistory] = useVisibleSearchesHistory();
  const [, setUsername] = useQueryUsername();

  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [, dispatchStargazers] = useTrackedStateStargazers();
  const [, dispatch] = useTrackedState();
  const [isHovered, setIsHovered] = useState(false);
  const displayName: string = (Result as React.ComponentType<any>).displayName || '';
  const searchesAdded = useApolloFactory(displayName!).mutation.searchesAdded;
  const resultsRef = createRef<HTMLLIElement>();
  const onMouseOver = () => {
    setIsHovered(true);
  };
  const onMouseLeave = () => {
    setIsHovered(false);
  };
  const handleClickOutside = useStableCallback((event: any) => {
    if (
      !resultsRef?.current ||
      (resultsRef?.current?.contains && resultsRef?.current?.contains(event.target)) ||
      [].some((substring) => {
        //at least there's one true for this regex pattern
        return new RegExp(substring).test(event?.target?.parentElement?.className);
      })
    ) {
      return;
    }
    parallel([
      () => setVisible(false),
      () => setVisibleSearchesHistory(false),
      () => setUsername(''),
      () =>
        dispatch({
          type: 'VISIBLE',
          payload: { visible: false },
        }),
      () =>
        dispatch({
          type: 'SEARCH_USERS',
          payload: {
            data: [],
          },
        }),
    ]);
  });
  useEffect(() => {
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleClickOutside]);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    parallel([
      () =>
        dispatch({
          type: 'REMOVE_ALL',
        }),
      () =>
        dispatchStargazers({
          type: 'REMOVE_ALL',
        }),
      () =>
        dispatchShared({
          type: 'QUERY_USERNAME',
          payload: {
            queryUsername: [userName],
          },
        }),
      () =>
        dispatchShared({
          type: 'SET_SHOULD_RENDER',
          payload: {
            shouldRender: ShouldRender.Home,
          },
        }),
      () => {
        if (stateShared.isLoggedIn) {
          searchesAdded({
            getSearches: { searches: [Object.assign({}, { search: userName, updatedAt: new Date(), count: 1 })] },
          })
            .then(() => {})
            .catch((e) => new Error(e));
        }
      },
    ]);
  };
  return (
    <li
      {...getRootProps({ onClick })}
      className={`${isHovered ? 'hovered' : ''} clearfix`}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      ref={resultsRef}
    >
      <div>{children()}</div>
    </li>
  );
};
Result.displayName = 'Result';
export default Result;
