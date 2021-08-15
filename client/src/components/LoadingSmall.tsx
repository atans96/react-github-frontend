import React from 'react';

export const LoadingSmall = () => {
  return (
    <React.Fragment>
      <div
        className="loading-spinner"
        style={{
          height: 'auto',
          margin: '0 auto',
          padding: '10px',
          position: 'relative',
        }}
      />
      <h6>
        Loading<span className="one">.</span>
        <span className="two">.</span>
        <span className="three">.</span>
      </h6>
    </React.Fragment>
  );
};
