import React, { useContext, useState } from 'react';
import { dispatchUsername } from '../../../store/dispatcher';
import { Context, ContextStargazers } from '../../../index';
import { IState } from '../../../typing/interface';
import { useApolloFactorySelector } from '../../../selectors/stateSelector';

interface Result {
  children: React.ReactNode;
  userName: string;
  getRootProps: any;
  state: IState;
}

const Result: React.FC<Result> = ({ state, children, userName, getRootProps }) => {
  const { dispatch } = useContext(Context);
  const { dispatchStargazers } = useContext(ContextStargazers);
  const [isHovered, setIsHovered] = useState(false);
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
    dispatchUsername(userName, dispatch);
    if (state.isLoggedIn) {
      useApolloFactorySelector((mutation: any) => mutation)
        .searchesAdded({
          variables: {
            search: [Object.assign({}, { search: userName, updatedAt: new Date(), count: 1 })],
          },
        })
        .then(() => {});
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

export default Result;
