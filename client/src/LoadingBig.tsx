import eye from './new_16-2.gif';
import React from 'react';

export const LoadingBig = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <img src={eye} style={{ width: '100px' }} />
      <div style={{ textAlign: 'center' }}>
        <h3>Please wait while fetching your data</h3>
      </div>
    </div>
  );
};
