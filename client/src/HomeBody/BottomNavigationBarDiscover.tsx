import React from 'react';
import { IState } from '../typing/interface';
import PaginationBarDiscover from '../BottomNavigationBarBody/PaginationBarDiscover';

interface BottomNavigationBarProps {
  state: IState;
}

const BottomNavigationBarDiscover: React.FC<BottomNavigationBarProps> = ({ state }) => {
  return (
    <React.Fragment>
      <PaginationBarDiscover state={state} />
    </React.Fragment>
  );
};
export default BottomNavigationBarDiscover;
