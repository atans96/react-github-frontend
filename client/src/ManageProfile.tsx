import React, { useCallback, useReducer, useRef, useState } from 'react';
import { fastFilter } from './util';
import ColumnOne from './ManageProfileBody/ColumnOne';
import { IAction, IState } from './typing/interface';
import { useResizeHandler } from './hooks/hooks';
import ColumnTwo from './ManageProfileBody/ColumnTwo';

interface ManageProfileProps {
  state: IState;
  dispatch: any;
}
export interface State {
  columnWidth: Map<string, any>;
}
const ColumnWidth = new Map(
  [
    { name: 'ColumnOne', width: 250, draggerPosition: 250 },
    { name: 'ColumnTwo', width: 350, draggerPosition: 350 },
  ].map((obj: ColumnWidthProps) => [obj.name, obj])
);

const initialState: State = {
  columnWidth: ColumnWidth,
};
export interface ColumnWidthProps {
  name: string;
  width: number;
  draggerPosition: number;
}
type ManageProfileAction = 'modify';

const reducer = (state = initialState, action: IAction<ManageProfileAction>) => {
  switch (action.type) {
    case 'modify': {
      return {
        ...state,
        columnWidth: action.payload.columnWidth,
      };
    }
  }
};
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
  const [stateReducer, dispatchReducer] = useReducer(reducer, initialState);
  return (
    <div style={{ display: 'flex' }} ref={manageProfileRef}>
      <ColumnOne
        handleLanguageFilter={handleLanguageFilter}
        state={columnOneDataMemoize()}
        dispatch={dispatch}
        stateReducer={stateReducer.columnWidth}
        dispatchReducer={dispatchReducer}
      />
      <ColumnTwo
        languageFilter={languageFilter}
        dispatch={dispatch}
        stateReducer={stateReducer.columnWidth}
        dispatchReducer={dispatchReducer}
        state={columnTwoDataMemoize()}
      />
    </div>
  );
};
ManageProfile.displayName = 'ManageProfile';
export default ManageProfile;
