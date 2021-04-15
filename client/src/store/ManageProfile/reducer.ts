import { IAction, IStateManageProfile } from '../../typing/interface';

export type ActionManageProfile = 'CONTRIBUTORS_ADDED' | 'REPO_INFO_ADDED';

export const initialStateManageProfile: IStateManageProfile = {
  contributors: [],
  repoInfo: [],
};
export const reducerManageProfile = (
  state = initialStateManageProfile,
  action: IAction<ActionManageProfile>
): IStateManageProfile => {
  switch (action.type) {
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
