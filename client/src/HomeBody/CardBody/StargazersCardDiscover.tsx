import React, { useState } from 'react';
import { StarIcon } from '../../util/icons';
import { isEqualObjects } from '../../util';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { useApolloFactory } from '../../hooks/useApolloFactory';

interface StargazersCardDiscover {
  stargazerCount: string;
  githubDataId: number;
}

const StargazersCardDiscover = React.memo<StargazersCardDiscover>(
  ({ githubDataId, stargazerCount }) => {
    const displayName: string | undefined = (StargazersCardDiscover as React.ComponentType<any>).displayName;
    const { userStarred } = useApolloFactory(displayName!).query.getUserInfoStarred();
    const [starClicked, setStarClicked] = useState(
      userStarred?.getUserInfoStarred?.starred?.includes(githubDataId) || false
    );
    return (
      <div className={`stargazer-card-container`}>
        <div
          className={'star-container'}
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          {[...Array(50)].map((_, idx) => {
            return <i key={idx} />;
          })}
          <div style={{ marginLeft: '5px', cursor: 'pointer' }}>
            <If condition={starClicked}>
              <Then>
                <StarIcon />
              </Then>
            </If>
            <If condition={!starClicked}>
              <Then>
                <StarBorderIcon />
              </Then>
            </If>
          </div>
          <div style={{ marginRight: '5px', cursor: 'pointer' }}>
            <span style={{ fontSize: '15px' }}>{starClicked ? 'Unstar' : 'Star'}</span>
          </div>
        </div>

        <div className="star-counts-container">
          <span
            style={{
              textAlign: 'center',
              cursor: 'default',
              marginLeft: '5px',
              marginRight: '5px',
              fontSize: '15px',
              display: 'inline',
              color: 'blue',
            }}
          >
            {stargazerCount}
          </span>
        </div>
      </div>
    );
  },
  (prevProps: any, nextProps: any) => {
    return isEqualObjects(prevProps.stateStargazers, nextProps.stateStargazers);
  }
);
StargazersCardDiscover.displayName = 'StargazersCardDiscover';
export default StargazersCardDiscover;
