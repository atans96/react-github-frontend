import { IAction, IStateManageProfile } from '../../typing/interface';

export interface ColumnWidthProps {
  name: string;
  width: number;
  draggerPosition: number;
}

const ColumnWidth = new Map(
  [
    { name: 'ColumnOne', width: 250, draggerPosition: 250 },
    { name: 'ColumnTwo', width: 350, draggerPosition: 350 },
  ].map((obj: ColumnWidthProps) => [obj.name, obj])
);
export type ActionManageProfile = 'MODIFY' | 'CONTRIBUTORS_ADDED' | 'REPO_INFO_ADDED';

export const initialStateManageProfile: IStateManageProfile = {
  columnWidth: ColumnWidth,
  contributors: [],
  repoInfo: [],
};
export const reducerManageProfile = (
  state = initialStateManageProfile,
  action: IAction<ActionManageProfile>
): IStateManageProfile => {
  switch (action.type) {
    case 'MODIFY': {
      return {
        ...state,
        columnWidth: action.payload.columnWidth,
      };
    }
    case 'REPO_INFO_ADDED': {
      return {
        ...state,
        repoInfo: action.payload.repoInfo,
      };
    }
    case 'CONTRIBUTORS_ADDED': {
      return {
        ...state,
        contributors: action.payload.contributors,
      };
    }
    default:
      return state;
  }
};
