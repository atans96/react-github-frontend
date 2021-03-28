import React from 'react';
import { isEqualObjects } from '../../../../util';
import { ContributorsProps } from '../../../../typing/type';
import { useHistory } from 'react-router';
import { IAction } from '../../../../typing/interface';
import { ActionShared } from '../../../../store/Shared/reducer';

interface ContributorProps {
  obj: ContributorsProps;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
}

const Contributor = React.memo<ContributorProps>(
  ({ obj, dispatchShared }) => {
    const history = useHistory();
    const handleContributorsClicked = (e: React.MouseEvent) => (contributor: string) => {
      e.preventDefault();
      dispatchShared({
        type: 'USERNAME_ADDED',
        payload: {
          username: contributor,
        },
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
  },
  (prevProps: any, nextProps: any) => {
    return isEqualObjects(prevProps.obj, nextProps.obj);
  }
);
Contributor.displayName = 'Contributor';
export default Contributor;
