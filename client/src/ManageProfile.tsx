import React, { useCallback, useRef, useState } from 'react';
import { fastFilter } from './util';
import ColumnOne from './ManageProfileBody/ColumnOne';
import { useResizeHandler } from './hooks/hooks';
import ColumnTwo from './ManageProfileBody/ColumnTwo';
import { useTrackedStateShared } from './selectors/stateContextSelector';
import { StateManageProfileProvider } from './selectors/stateContextSelector';
import { createRenderElement } from './Layout/MasonryLayout';
import { Redirect } from 'react-router-dom';
import KeepMountedLayout from './Layout/KeepMountedLayout';

const ManageProfile = () => {
  const [, dispatch] = useTrackedStateShared();
  const [languageFilter, setLanguageFilter] = useState<string[]>([]);
  const handleLanguageFilter = useCallback((language, remove = false) => {
    if (language && !remove) {
      setLanguageFilter((prevState) => {
        return [...prevState, language];
      });
    } else {
      setLanguageFilter((prevState) => {
        return fastFilter((obj: any) => obj !== language, prevState);
      });
    }
  }, []);

  const manageProfileRef = useRef<HTMLDivElement>(null);

  function handleResize() {
    dispatch({
      type: 'SET_WIDTH',
      payload: {
        width: window.innerWidth,
      },
    });
  }
  useResizeHandler(manageProfileRef, handleResize);
  //TODO: highlight the search word in markdown using: https://github.com/jonschlinkert/remarkable (highlight.js)
  return (
    <div style={{ display: 'flex' }} ref={manageProfileRef}>
      <StateManageProfileProvider>
        {createRenderElement(ColumnOne, { handleLanguageFilter })}
        {createRenderElement(ColumnTwo, { languageFilter })}
      </StateManageProfileProvider>
    </div>
  );
};
ManageProfile.displayName = 'ManageProfile';
const ManageProfileRender = ({ isLoggedIn = false }) => {
  return (
    <KeepMountedLayout
      mountedCondition={location.pathname === '/profile'}
      render={() => {
        if (isLoggedIn) {
          return createRenderElement(ManageProfile, {});
        } else {
          return <Redirect to={'/login'} from={'/profile'} />;
        }
      }}
    />
  );
};
export default ManageProfileRender;
