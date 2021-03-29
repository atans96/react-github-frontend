import React, { useCallback, useRef, useState } from 'react';
import { fastFilter } from './util';
import ColumnOne from './ManageProfileBody/ColumnOne';
import { IAction, IStateManageProfile, IStateShared } from './typing/interface';
import { useResizeHandler } from './hooks/hooks';
import ColumnTwo from './ManageProfileBody/ColumnTwo';
import { ActionManageProfile } from './store/ManageProfile/reducer';
import { ActionShared } from './store/Shared/reducer';
import { Action } from './store/Home/reducer';

interface ManageProfileProps {
  stateShared: IStateShared;
  stateManageProfile: IStateManageProfile;
  dispatchManageProfile: React.Dispatch<IAction<ActionManageProfile>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
  dispatch: React.Dispatch<IAction<Action>>;
}

const ManageProfile: React.FC<ManageProfileProps> = ({
  stateShared,
  dispatchManageProfile,
  stateManageProfile,
  dispatchShared,
  dispatch,
}) => {
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

  const columnOneDataMemoize = useCallback(() => {
    return stateShared;
  }, [stateShared.fetchDataPath]);

  const stateManageProfileMemo = useCallback(() => {
    return stateManageProfile;
  }, [stateManageProfile.repoInfo, stateManageProfile.contributors, stateManageProfile.columnWidth]);

  const stateSharedMemo = useCallback(() => {
    return stateShared;
  }, [stateShared.width]);

  const manageProfileRef = useRef<HTMLDivElement>(null);

  function handleResize() {
    dispatchShared({
      type: 'SET_WIDTH',
      payload: {
        width: window.innerWidth,
      },
    });
  }
  useResizeHandler(manageProfileRef, handleResize);
  return (
    <div style={{ display: 'flex' }} ref={manageProfileRef}>
      <ColumnOne
        handleLanguageFilter={handleLanguageFilter}
        state={columnOneDataMemoize()}
        dispatchManageProfile={dispatchManageProfile}
        dispatchShared={dispatchShared}
        columnWidth={stateManageProfile.columnWidth}
      />
      <ColumnTwo
        languageFilter={languageFilter}
        dispatchManageProfile={dispatchManageProfile}
        dispatchShared={dispatchShared}
        dispatch={dispatch}
        stateManageProfile={stateManageProfileMemo()}
        stateShared={stateSharedMemo()}
      />
    </div>
  );
};
ManageProfile.displayName = 'ManageProfile';
export default ManageProfile;
