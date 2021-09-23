import React from 'react';
import { useHistory } from 'react-router-dom';
import { useTrackedState, useTrackedStateShared } from '../../../../../selectors/stateContextSelector';
import { ContributorProps } from '../../../../../typing/type';
import { useGetSearchesMutation } from '../../../../../apolloFactory/useGetSearchesMutation';
import { ShouldRender } from '../../../../../typing/enum';

interface Props {
  obj: ContributorProps;
}

const Contributor: React.FC<Props> = ({ obj }) => {
  const history = useHistory();
  const [, dispatchShared] = useTrackedStateShared();
  const [, dispatch] = useTrackedState();
  const searchesAdded = useGetSearchesMutation();
  const handleContributorsClicked = (e: React.MouseEvent) => (contributor: string) => {
    e.preventDefault();
    e.stopPropagation();
    searchesAdded({
      getSearches: {
        searches: [
          Object.assign(
            {},
            {
              search: contributor,
              updatedAt: new Date(),
              count: 1,
            }
          ),
        ],
      },
    });
    dispatchShared({
      type: 'QUERY_USERNAME',
      payload: {
        queryUsername: contributor,
      },
    });
    dispatchShared({
      type: 'SET_SHOULD_RENDER',
      payload: {
        shouldRender: ShouldRender.Home,
      },
    });
    dispatch({
      type: 'MERGED_DATA_ADDED',
      payload: { data: [] },
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
