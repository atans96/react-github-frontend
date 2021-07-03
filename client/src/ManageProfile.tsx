import React, { useCallback, useRef, useState } from 'react';
import { fastFilter } from './util';
import { useResizeHandler } from './hooks/hooks';
import { useTrackedStateShared } from './selectors/stateContextSelector';
import { StateManageProfileProvider } from './selectors/stateContextSelector';
import { createRenderElement } from './Layout/MasonryLayout';
import KeepMountedLayout from './Layout/KeepMountedLayout';
import { loadable } from './loadable';

const ColumnOne = (args: { handleLanguageFilter: any }) =>
  loadable({
    importFn: () =>
      import('./ManageProfileBody/ColumnOne').then((module) => createRenderElement(module.default, { ...args })),
    cacheId: 'ColumnOne',
    empty: () => <></>,
  });

const ColumnTwo = (args: { languageFilter: string[] }) =>
  loadable({
    importFn: () =>
      import('./ManageProfileBody/ColumnTwo').then((module) => createRenderElement(module.default, { ...args })),
    cacheId: 'ColumnTwo',
    empty: () => <></>,
  });

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
        {ColumnOne({ handleLanguageFilter })}
        {ColumnTwo({ languageFilter })}
      </StateManageProfileProvider>
    </div>
  );
};
ManageProfile.displayName = 'ManageProfile';
const ManageProfileRender = () => {
  return <KeepMountedLayout mountedCondition={location.pathname === '/profile'} render={() => ManageProfile} />;
};
export default ManageProfileRender;
