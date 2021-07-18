import React from 'react';
import { useHistory } from 'react-router-dom';
import { ContributorProps } from '../../../../typing/type';
import { SharedStore } from '../../../../store/Shared/reducer';
import { HomeStore } from '../../../../store/Home/reducer';

interface Props {
  obj: ContributorProps;
}

const Contributor: React.FC<Props> = ({ obj }) => {
  const history = useHistory();
  const handleContributorsClicked = (e: React.MouseEvent) => (contributor: string) => {
    e.preventDefault();
    SharedStore.dispatch({
      type: 'QUERY_USERNAME',
      payload: {
        queryUsername: contributor,
      },
    });
    HomeStore.dispatch({
      type: 'MERGED_DATA_ADDED',
      payload: { data: [] },
    });
    HomeStore.dispatch({
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
