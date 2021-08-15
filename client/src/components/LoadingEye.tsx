import eye from './new_16-2.gif';
import React from 'react';

interface LoadingEye {
  queryUsername: string[] | string;
}
const LoadingEye: React.FC<LoadingEye> = ({ queryUsername }) => {
  return (
    <div style={{ textAlign: 'center' }}>
      <img src={eye} style={{ width: '100px' }} />
      <div style={{ textAlign: 'center' }}>
        <h3>
          Please wait while fetching your query of:{' '}
          <p>
            <a className={'underlining'}>
              {Array.isArray(queryUsername) && queryUsername.length > 0 ? queryUsername.join(', ') : queryUsername}
            </a>
          </p>
        </h3>
      </div>
    </div>
  );
};
LoadingEye.displayName = 'LoadingEye';
export default LoadingEye;
