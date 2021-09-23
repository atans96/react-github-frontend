import React, { useState } from 'react';
import {
  useTrackedState,
  useTrackedStateShared,
  useTrackedStateStargazers,
} from '../../../../selectors/stateContextSelector';
import { useQueryUsername, useVisible, useVisibleSearchesHistory } from '../../../SearchBar';
import { useStableCallback } from '../../../../util';
import { ShouldRender } from '../../../../typing/enum';
import { useGetSearchesMutation } from '../../../../apolloFactory/useGetSearchesMutation';
import { useOuterClick } from '../../../../hooks/hooks';
import { useIsFetchFinish } from '../../../Home';

interface Result {
  userName: string;
  getRootProps: any;

  children(): React.ReactNode;
}

const Result: React.FC<Result> = ({ children, userName, getRootProps }) => {
  const searchesAdded = useGetSearchesMutation();
  const [, setVisible] = useVisible();
  const [, setIsFetchFinish] = useIsFetchFinish();
  const [, setVisibleSearchesHistory] = useVisibleSearchesHistory();
  const [, setUsername] = useQueryUsername();

  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [, dispatchStargazers] = useTrackedStateStargazers();
  const [, dispatch] = useTrackedState();
  const [isHovered, setIsHovered] = useState(false);
  const onMouseOver = () => {
    setIsHovered(true);
  };
  const onMouseLeave = () => {
    setIsHovered(false);
  };
  const handleClick = useStableCallback((event: any) => {
    dispatch({
      type: 'REMOVE_ALL',
    });
    dispatch({
      type: 'FILTER_CARDS_BY_SEEN',
      payload: {
        filterBySeen: true,
      },
    });
    dispatchStargazers({
      type: 'REMOVE_ALL',
    });
    dispatchShared({
      type: 'QUERY_USERNAME',
      payload: {
        queryUsername: [userName],
      },
    });
    dispatchShared({
      type: 'SET_SHOULD_RENDER',
      payload: {
        shouldRender: ShouldRender.Home,
      },
    });
    if (stateShared.isLoggedIn) {
      searchesAdded({
        getSearches: { searches: [Object.assign({}, { search: userName, updatedAt: new Date(), count: 1 })] },
      });
    }
    setIsFetchFinish({ isFetchFinish: false });
    setUsername('');
    dispatch({
      type: 'SEARCH_USERS',
      payload: {
        data: [],
      },
    });
    setVisible(false);
    setVisibleSearchesHistory(false);
    dispatch({
      type: 'VISIBLE',
      payload: { visible: false },
    });
  });
  const innerRef = useOuterClick(() => {
    setVisible(false);
    setVisibleSearchesHistory(false);
    dispatch({
      type: 'VISIBLE',
      payload: { visible: false },
    });
  }) as any;
  return (
    <li
      {...getRootProps(() => {})}
      className={`${isHovered ? 'hovered' : ''} clearfix`}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      onClick={handleClick}
      ref={innerRef}
    >
      <div>{children()}</div>
    </li>
  );
};
Result.displayName = 'Result';
export default Result;
