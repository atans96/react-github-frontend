import React, { useEffect, useRef } from 'react';
import { useTrackedStateShared } from '../selectors/stateContextSelector';
import { createStore } from '../util/hooksy';
import PureSearchBar from './SearchBarBody/PureSearchBar';
import './style.css';
import { readEnvironmentVariable } from '../util';
import { noop } from '../util/util';

const defaultVisible = false;
const defaulQueryUsername = '';
const defaultVisibleSearchesHistory = false;
export const [useVisible] = createStore(defaultVisible);
export const [useVisibleSearchesHistory] = createStore(defaultVisibleSearchesHistory);
export const [useQueryUsername] = createStore(defaulQueryUsername);

const SearchBar = () => {
  //TODO: https://github.com/moroshko/react-autosuggest
  const [stateShared] = useTrackedStateShared();
  const portalExpandable = useRef(null);
  // useEffect(() => {
  //   sessionStorage.setItem('is_reloaded', JSON.stringify('true'));
  // }, []);
  // if (sessionStorage.getItem('is_reloaded')) {
  //   Promise.all([
  //     fetch(
  //       `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable(
  //         'GOLANG_PORT_IMG'
  //       )}/images_from_markdown`,
  //       {
  //         method: 'POST',
  //         credentials: 'include',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'X-User-Connection': 'close',
  //           origin: `${readEnvironmentVariable('CLIENT_HOST')}:${readEnvironmentVariable('CLIENT_PORT')}`,
  //         },
  //         body: '',
  //       }
  //     ),
  //   ]).then(noop);
  // }
  return (
    //  use display: grid so that when PureSearchBar is expanded with its multi-select, the div of this parent
    //won't move to the top direction. It will stay as it is while the Search Bar is expanding to the bottom
    <div
      style={{
        display: 'grid',
        justifyContent: 'center',
      }}
    >
      <div className="title-horizontal-center" style={{ width: `${stateShared.width}px` }}>
        <p>Github Dashboard Fetcher</p>
      </div>
      <PureSearchBar portalExpandable={portalExpandable} />
      <div className="portal-expandable" ref={portalExpandable} style={{ width: `${stateShared.width}px` }} />
    </div>
  );
};
SearchBar.displayName = 'SearchBar';
export default SearchBar;
