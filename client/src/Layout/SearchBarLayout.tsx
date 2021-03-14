import React, { useRef } from 'react';

interface SearchBarLayout {
  children(portalSliderRef: React.RefObject<HTMLDivElement>): React.ReactNode;
  onSubmit: React.FormEventHandler;
  style?: React.CSSProperties;
}
const SearchBarLayout: React.FC<SearchBarLayout> = ({ onSubmit, children, style }) => {
  const portal = useRef(null);
  //in order to make flex to be expanded but still the arrangement is in-line with input-group
  //you need to use display: '-webkit-inline-box' in the parent, and make
  //display: inline-flex for the children
  return (
    <div className="search-bar-container" style={style}>
      <form action="#" method="get" id="searchForm" className="input-group" onSubmit={onSubmit}>
        <div className="input-group" style={{ display: '-webkit-inline-box' }}>
          {children(portal)}
        </div>
        <div id="portal-searchbar" ref={portal} />
      </form>
    </div>
  );
};
SearchBarLayout.displayName = 'SearchBarLayout';
export default SearchBarLayout;
