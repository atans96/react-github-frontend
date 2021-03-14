import React, { useState } from 'react';
import { dispatchUsername } from '../../../store/dispatcher';
import { IState } from '../../../typing/interface';
import { useApolloFactory } from '../../../hooks/useApolloFactory';

interface Result {
  children: React.ReactNode;
  userName: string;
  getRootProps: any;
  state: IState;
  dispatch: any;
  dispatchStargazer: any;
}

const Result: React.FC<Result> = ({ state, children, userName, getRootProps, dispatch, dispatchStargazer }) => {
  const [isHovered, setIsHovered] = useState(false);
  const searchesAdded = useApolloFactory().mutation.searchesAdded;
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
    dispatchUsername(userName, dispatch);
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
