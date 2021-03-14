import React from 'react';
import { isEqualObjects } from '../../../util';
import { ContributorsProps } from '../../../typing/type';
import {useHistory} from "react-router";

interface ContributorProps {
  obj: ContributorsProps;
  dispatch: any;
}

const Contributor = React.memo<ContributorProps>(
  ({ obj, dispatch }) => {
      const history = useHistory();
    const handleContributorsClicked = (e: React.MouseEvent) => (contributor: string) => {
      e.preventDefault();
      dispatch({
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
export default Contributor;
