import React, { useCallback, useRef, useState } from 'react';
import { fastFilter } from './util';
import ColumnOne from './ManageProfileBody/ColumnOne';
import { useResizeHandler } from './hooks/hooks';
import ColumnTwo from './ManageProfileBody/ColumnTwo';
import { useTrackedStateShared } from './selectors/stateContextSelector';
import { StateManageProfileProvider } from './selectors/stateContextSelector';
import { createRenderElement } from './Layout/MasonryLayout';

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
export default ManageProfile;
