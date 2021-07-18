import React, { useState } from 'react';
import { useApolloFactory } from '../../../hooks/useApolloFactory';
import { noop } from '../../../util/util';
import { SharedStore } from '../../../store/Shared/reducer';
import { StargazersStore } from '../../../store/Staargazers/reducer';
import { HomeStore } from '../../../store/Home/reducer';

interface Result {
  children: React.ReactNode;
  userName: string;
  getRootProps: any;
}

const Result: React.FC<Result> = ({ children, userName, getRootProps }) => {
  const { isLoggedIn } = SharedStore.store().IsLoggedIn();
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
    HomeStore.dispatch({
      type: 'REMOVE_ALL',
    });
    StargazersStore.dispatch({
      type: 'REMOVE_ALL',
    });
    SharedStore.dispatch({
      type: 'QUERY_USERNAME',
      payload: {
        queryUsername: userName,
      },
    });
    if (isLoggedIn) {
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
