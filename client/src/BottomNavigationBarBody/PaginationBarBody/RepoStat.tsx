import React from 'react';
import { BottomNavigationBarProps } from '../../HomeBody/BottomNavigationBar';
import './RepoStat.css';

const RepoStat: React.FC<{
  componentProps: Pick<BottomNavigationBarProps, 'state'>;
}> = (props) => {
  return (
    <div id={'container-stat'}>
      {props.componentProps.state.repoStat.map((arr, idx) => {
        return (
          <React.Fragment key={idx}>
            <div id="box-stat" style={{ borderRight: '1px solid black' }}>
              <span style={{ padding: '10px' }}>
                {arr[0]}: {arr[1]}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
RepoStat.displayName = 'RepoStat';
export default RepoStat;
