import { IStateManageProfile } from '../../typing/interface';
import { createStore } from '../../util/hooksy';
import { ContributorsProps, RepoInfoProps } from '../../typing/type';
import { deepEqual } from 'fast-equals';

export type ActionManageProfile = 'CONTRIBUTORS_ADDED' | 'REPO_INFO_ADDED';

export const initialStateManageProfile: IStateManageProfile = {
  contributors: [],
  repoInfo: [],
};
const [getRepoInfo, setRepoInfo] = createStore<RepoInfoProps[]>(initialStateManageProfile.repoInfo);
const [getContributors, setContributors] = createStore<ContributorsProps[]>(initialStateManageProfile.contributors);
export const ManageProfileStore = {
  store() {
    return {
      RepoInfo: () => {
        const [repoInfo] = getRepoInfo({
          shouldUpdate(oldData, newData) {
            return deepEqual(oldData, newData);
          },
        });
        return { repoInfo } as { repoInfo: RepoInfoProps[] };
      },
      Contributors: () => {
        const [contributors] = getContributors({
          shouldUpdate(oldData, newData) {
            return deepEqual(oldData, newData);
          },
        });
        return { contributors } as { contributors: ContributorsProps[] };
      },
    };
  },
  dispatch({ type, payload }: { type: ActionManageProfile; payload?: any }) {
    switch (type) {
      case 'REPO_INFO_ADDED': {
        setRepoInfo(payload.repoInfo);
        break;
      }
      case 'CONTRIBUTORS_ADDED': {
        setContributors(payload.contributors);
        break;
      }
    }
  },
};
