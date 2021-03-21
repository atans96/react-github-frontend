import React, { useCallback, useReducer, useRef, useState } from 'react';
import { fastFilter } from './util';
import ColumnOne from './ManageProfileBody/ColumnOne';
import { IState } from './typing/interface';
import { useResizeHandler } from './hooks/hooks';
import ColumnTwo from './ManageProfileBody/ColumnTwo';
import { SinglyLinkedList } from './util/util';
interface ManageProfileProps {
  state: IState;
  dispatch: any;
}
const list = new SinglyLinkedList<ColumnWidthProps>();
const columnWidth = list.fromArrayRightToLeft<ColumnWidthProps>([
  { name: 1, width: 250 },
  { name: 2, width: 300 },
]);

export interface ColumnWidthProps {
  name: number;
  width: number;
}
const reducer = (columnWidth: any, action: any) => {
  if (action.type === 'modify') {
    return columnWidth.map((column: any) => {
      if (column.name == action.payload.name) {
        column.width = action.payload.width;
      }
      return column;
    });
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
  const [stateReducer, dispatchReducer] = useReducer(reducer, columnWidth);
  return (
    <div style={{ display: 'flex' }} ref={manageProfileRef}>
      <ColumnOne
        handleLanguageFilter={handleLanguageFilter}
        state={columnOneDataMemoize()}
        dispatch={dispatch}
        stateReducer={stateReducer}
        dispatchReducer={dispatchReducer}
      />
      <ColumnTwo
        languageFilter={languageFilter}
        dispatch={dispatch}
        stateReducer={stateReducer}
        dispatchReducer={dispatchReducer}
        state={columnTwoDataMemoize()}
      />
    </div>
  );
};
ManageProfile.displayName = 'ManageProfile';
export default ManageProfile;
