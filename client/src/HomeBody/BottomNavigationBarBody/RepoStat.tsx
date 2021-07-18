import React from 'react';
import './RepoStat.css';
import { HomeStore } from '../../store/Home/reducer';

const RepoStat = () => {
  return (
    <div id={'container-stat'}>
      {HomeStore.store()
        .RepoStat()
        .repoStat.map((arr, idx) => {
          return (
            <React.Fragment key={idx}>
              <div id="box-stat" style={{ borderRight: '1px solid black' }}>
                <span style={{ padding: '10px' }}>
                  {arr[0]}: {arr[1]}
                </span>
              </div>
            </React.Fragment>
          );
        }) || <></>}
    </div>
  );
};
RepoStat.displayName = 'RepoStat';
export default RepoStat;
