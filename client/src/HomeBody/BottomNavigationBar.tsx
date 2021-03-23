import React from 'react';
import { IState } from '../typing/interface';
import PaginationBar from '../BottomNavigationBarBody/PaginationBar';
import DrawerBar from '../BottomNavigationBarBody/DrawerBar';

interface BottomNavigationBarProps {
  state: IState;
  dispatch: any;
  dispatchStargazersUser: any;
}

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({ dispatchStargazersUser, state, dispatch }) => {
  return (
    <React.Fragment>
      <PaginationBar state={state} dispatch={dispatch} />
      <DrawerBar dispatch={dispatch} state={state} dispatchStargazersUser={dispatchStargazersUser} />
    </React.Fragment>
  );
};
BottomNavigationBar.displayName = 'BottomNavigationBar';
export default BottomNavigationBar;
