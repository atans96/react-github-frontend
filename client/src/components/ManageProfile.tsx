import React, { useRef, useState } from 'react';
import { fastFilter, useStableCallback } from '../util';
import { StateManageProfileProvider, useTrackedStateShared } from '../selectors/stateContextSelector';
import { Redirect } from 'react-router-dom';
import useResizeObserver from '../hooks/useResizeObserver';
import Loadable from 'react-loadable';
import Empty from './Layout/EmptyLayout';

const ColumnOne = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "ColumnOne" */ './ManageProfileBody/ColumnOne'),
});
const ColumnTwo = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "ColumnTwo" */ './ManageProfileBody/ColumnTwo'),
});
const ManageProfile = () => {
  const [state, dispatch] = useTrackedStateShared();
  const [languageFilter, setLanguageFilter] = useState<string[]>([]);
  const handleLanguageFilter = useStableCallback((language: string, remove = false) => {
    if (language && !remove) {
      setLanguageFilter((prevState) => {
        return [...prevState, language];
      });
    } else {
      setLanguageFilter((prevState) => {
        return fastFilter((obj: any) => obj !== language, prevState);
      });
    }
  });

  const manageProfileRef = useRef<HTMLDivElement>(null);

  useResizeObserver(manageProfileRef, (entry: any) => {
    if (state.width !== entry.contentRect.width) {
      dispatch({
        type: 'SET_WIDTH',
        payload: {
          width: entry.contentRect.width,
        },
      });
    }
  });
  if (!state.isLoggedIn) return <Redirect to={'/login'} from={'/profile'} />;
  //TODO: highlight the search word in markdown using: https://github.com/jonschlinkert/remarkable (highlight.js)
  return (
    <div style={{ display: 'flex' }} ref={manageProfileRef}>
      <StateManageProfileProvider>
        <ColumnOne handleLanguageFilter={handleLanguageFilter} />
        {/*<ColumnTwo languageFilter={languageFilter} />*/}
      </StateManageProfileProvider>
    </div>
  );
};
ManageProfile.displayName = 'ManageProfile';
export default React.memo(ManageProfile);
