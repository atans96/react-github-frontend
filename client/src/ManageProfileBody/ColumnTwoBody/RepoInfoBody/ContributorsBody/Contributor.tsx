import React from 'react';
import { ContributorsProps } from '../../../../typing/type';
import { useHistory } from 'react-router';
import { IAction } from '../../../../typing/interface';
import { ActionShared } from '../../../../store/Shared/reducer';
import { Action } from '../../../../store/Home/reducer';

interface ContributorProps {
  obj: ContributorsProps;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
  dispatch: React.Dispatch<IAction<Action>>;
}

const Contributor: React.FC<ContributorProps> = ({ obj, dispatchShared, dispatch }) => {
  const history = useHistory();
  const handleContributorsClicked = (e: React.MouseEvent) => (contributor: string) => {
    e.preventDefault();
    dispatchShared({
      type: 'USERNAME_ADDED',
      payload: {
        username: contributor,
      },
    });
    dispatch({
      type: 'MERGED_DATA_ADDED',
      payload: { data: [] },
    });
    dispatch({
      type: 'LAST_PAGE',
      payload: { lastPage: 0 },
    });
    history.push('/');
  };
  return (
    <div title={obj.login} className={'contributor'} onClick={(e) => handleContributorsClicked(e)(obj.login)}>
      <img alt="avatar" className="avatar-img" src={obj.avatar_url} />
      <div>
        <p>+ {obj.contributions}</p>
      </div>
    </div>
  );
};
Contributor.displayName = 'Contributor';
export default Contributor;
