import React, { useState } from 'react';
import { useApolloFactory } from '../../../hooks/useApolloFactory';
import {
  useTrackedState,
  useTrackedStateShared,
  useTrackedStateStargazers,
} from '../../../selectors/stateContextSelector';
import { noop } from '../../../util/util';

interface Result {
  children: React.ReactNode;
  userName: string;
  getRootProps: any;
}

const Result: React.FC<Result> = ({ children, userName, getRootProps }) => {
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [, dispatchStargazers] = useTrackedStateStargazers();
  const [, dispatch] = useTrackedState();
  const [isHovered, setIsHovered] = useState(false);
  const displayName: string | undefined = (Result as React.ComponentType<any>).displayName;
  const searchesAdded = useApolloFactory(displayName!).mutation.searchesAdded;
  const onMouseOver = () => {
    setIsHovered(true);
  };
  const onMouseLeave = () => {
    setIsHovered(false);
  };
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch({
      type: 'REMOVE_ALL',
    });
    dispatchStargazers({
      type: 'REMOVE_ALL',
    });
    dispatchShared({
      type: 'USERNAME_ADDED',
      payload: {
        username: userName,
      },
    });
    if (stateShared.isLoggedIn) {
      searchesAdded({
        getSearches: { searches: [Object.assign({}, { search: userName, updatedAt: new Date(), count: 1 })] },
      }).then(noop);
    }
  };
  return (
    <li
      {...getRootProps({ onClick })}
      className={`${isHovered ? 'hovered' : ''} clearfix`}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
      <div>{children}</div>
    </li>
  );
};
Result.displayName = 'Result';
export default Result;
