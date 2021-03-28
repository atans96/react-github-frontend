import React from 'react';
import { IAction, IState, IStateShared } from '../typing/interface';
import PaginationBar from '../BottomNavigationBarBody/PaginationBar';
import DrawerBar from '../BottomNavigationBarBody/DrawerBar';
import { Action } from '../store/reducer';
import { ActionStargazers } from '../store/Staargazers/reducer';
import { ActionShared } from '../store/Shared/reducer';

export interface BottomNavigationBarProps {
  state: IState;
  stateShared: IStateShared;
  dispatch: React.Dispatch<IAction<Action>>;
  dispatchStargazersUser: React.Dispatch<IAction<ActionStargazers>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
}

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  dispatchStargazersUser,
  state,
  dispatch,
  dispatchShared,
  stateShared,
}) => {
  return (
    <React.Fragment>
      <PaginationBar state={state} dispatch={dispatch} />
      <DrawerBar
        dispatch={dispatch}
        state={state}
        stateShared={stateShared}
        dispatchStargazersUser={dispatchStargazersUser}
        dispatchShared={dispatchShared}
      />
    </React.Fragment>
  );
};
BottomNavigationBar.displayName = 'BottomNavigationBar';
export default BottomNavigationBar;
