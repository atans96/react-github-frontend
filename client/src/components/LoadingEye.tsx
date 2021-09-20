import eye from './new_16-2.gif';
import React from 'react';

interface LoadingEye {
  queryUsername: string[] | string;
}
const LoadingEye: React.FC<LoadingEye> = ({ queryUsername }) => {
  const render = (queryUsername: string | string[]) => {
    if (!Array.isArray(queryUsername)) {
      if (queryUsername.length > 0) {
        return (
          <h3>
            Please wait while fetching your query of:{' '}
            <p>
              <a className={'underlining'}>{queryUsername}</a>
            </p>
          </h3>
        );
      } else {
        return <></>;
      }
    } else if (queryUsername.length > 0) {
      return (
        <h3>
          Please wait while fetching your query of:{' '}
          <p>
            <a className={'underlining'}>{queryUsername.length > 0 ? queryUsername.join(', ') : queryUsername}</a>
          </p>
        </h3>
      );
    } else {
      return <></>;
    }
  };
  return (
    <div style={{ textAlign: 'center' }}>
      <img src={eye} style={{ width: '100px' }} />
      <div style={{ textAlign: 'center' }}>{render(queryUsername)}</div>
    </div>
  );
};
LoadingEye.displayName = 'LoadingEye';
export default LoadingEye;
