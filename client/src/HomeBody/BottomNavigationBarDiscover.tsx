import React from 'react';
import { IStateDiscover } from '../typing/interface';
import PaginationBarDiscover from '../BottomNavigationBarBody/PaginationBarDiscover';

interface BottomNavigationBarProps {
  stateDiscover: IStateDiscover;
}

const BottomNavigationBarDiscover: React.FC<BottomNavigationBarProps> = ({ stateDiscover }) => {
  return (
    <React.Fragment>
      <PaginationBarDiscover stateDiscover={stateDiscover} />
    </React.Fragment>
  );
};
BottomNavigationBarDiscover.displayName = 'BottomNavigationBarDiscover';
export default BottomNavigationBarDiscover;
