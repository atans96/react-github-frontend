import React from 'react';
import { useHistory } from 'react-router-dom';
import { useTrackedState, useTrackedStateShared } from '../../../../selectors/stateContextSelector';
import { ContributorProps } from '../../../../typing/type';

interface Props {
  obj: ContributorProps;
}

const Contributor: React.FC<Props> = ({ obj }) => {
  const history = useHistory();
  const [, dispatchShared] = useTrackedStateShared();
  const [, dispatch] = useTrackedState();
  const handleContributorsClicked = (e: React.MouseEvent) => (contributor: string) => {
    e.preventDefault();
    dispatchShared({
      type: 'QUERY_USERNAME',
      payload: {
        queryUsername: contributor,
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
