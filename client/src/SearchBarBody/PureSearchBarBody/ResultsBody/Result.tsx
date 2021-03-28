import React, { useState } from 'react';
import { IAction, IStateShared } from '../../../typing/interface';
import { useApolloFactory } from '../../../hooks/useApolloFactory';
import { Action } from '../../../store/Home/reducer';
import { ActionStargazers } from '../../../store/Staargazers/reducer';
import { ActionShared } from '../../../store/Shared/reducer';

interface Result {
  children: React.ReactNode;
  userName: string;
  getRootProps: any;
  state: IStateShared;
  dispatch: React.Dispatch<IAction<Action>>;
  dispatchStargazer: React.Dispatch<IAction<ActionStargazers>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
}

const Result: React.FC<Result> = ({
  state,
  children,
  dispatchShared,
  userName,
  getRootProps,
  dispatch,
  dispatchStargazer,
}) => {
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
    dispatchStargazer({
      type: 'REMOVE_ALL',
    });
    dispatchShared({
      type: 'USERNAME_ADDED',
      payload: {
        username: userName,
      },
    });
    if (state.isLoggedIn) {
      searchesAdded({
        variables: {
          search: [Object.assign({}, { search: userName, updatedAt: new Date(), count: 1 })],
        },
      }).then(() => {});
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
