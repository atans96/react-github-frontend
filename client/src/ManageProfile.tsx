import React, { useCallback, useRef, useState } from 'react';
import { fastFilter } from './util';
import ColumnOne from './ManageProfileBody/ColumnOne';
import { IState } from './typing/interface';
import { useResizeHandler } from './hooks/hooks';
import ColumnTwo from './ManageProfileBody/ColumnTwo';
import { useDraggable } from './hooks/useDraggable';

interface ManageProfileProps {
  state: IState;
  dispatch: any;
}

const ManageProfile: React.FC<ManageProfileProps> = ({ state, dispatch }) => {
  const [languageFilter, setLanguageFilter] = useState<string[]>([]);
  const handleLanguageFilter = useCallback((language) => {
    if (language) {
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
    return state;
  }, [state.isLoggedIn, state.fetchDataPath]);

  const columnTwoDataMemoize = useCallback(() => {
    return state;
  }, [state.repoInfo, state.contributors]);

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
  const drawerRef = useRef<HTMLDivElement>(null);
  const defaultWidth = useRef(250);
  const { dragHandlers, drawerWidth } = useDraggable(drawerRef, defaultWidth.current);

  return (
    <div style={{ display: 'flex' }} ref={manageProfileRef}>
      <ColumnOne
        handleLanguageFilter={handleLanguageFilter}
        state={columnOneDataMemoize()}
        dispatch={dispatch}
        ref={drawerRef}
        dragHandlers={dragHandlers}
        drawerWidth={drawerWidth}
      />
      <ColumnTwo
        languageFilter={languageFilter}
        dispatch={dispatch}
        state={columnTwoDataMemoize()}
        columnOneWidth={drawerWidth}
      />
    </div>
  );
};
ManageProfile.displayName = 'ManageProfile';
export default ManageProfile;
