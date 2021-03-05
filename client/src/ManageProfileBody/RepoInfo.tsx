import React from 'react';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import UpdateIcon from '@material-ui/icons/Update';
import { ForkIcon } from '../util/icons';
import './LanguageStarsInfoStyle.scss';
import { isEqualObjects } from '../util';
import Contributors from './RepoInfoBody/Contributors';
import { RouteComponentProps } from 'react-router-dom';

interface RepoInfoProps {
  obj: any;
  onClickRepoInfo: any;
  contributions: any;
  dispatch: any;
  active: string;
}

const RepoInfo = React.memo<RepoInfoProps>(
  ({ obj, onClickRepoInfo, contributions, dispatch, active }) => {
    return (
      <div style={{ borderBottom: 'solid' }}>
        <div style={active === obj.fullName ? { borderLeft: '5px solid', backgroundColor: '#f8fafc' } : {}}>
          <div
            className={'repo-info'}
            onClick={(e) => {
              onClickRepoInfo(e)(obj.fullName, obj.defaultBranch, obj.html_url);
            }}
          >
            <div style={{ margin: '5px' }}>
              <div>
                <h3>{obj.fullName}</h3>
              </div>
              <div style={{ marginBottom: '5px' }}>
                <p>{obj.description}</p>
              </div>
              <div style={{ marginBottom: '5px' }}>
                <ul
                  style={{ width: 'fit-content', padding: '2px 1em', borderRadius: '5px' }}
                  className={`language ${obj?.language?.replace(/\+\+|#|\s/, '-')}`}
                >
                  <h6 style={{ color: 'white' }}>{obj.language}</h6>
                </ul>
              </div>
            </div>
            <div style={{ display: 'flex', margin: '5px' }}>
              <div style={{ display: 'flex', marginRight: '5px' }}>
                <StarBorderIcon />
                <p style={{ padding: '0 3px' }}>{obj.stars}</p>
              </div>
              <div style={{ display: 'flex', marginRight: '5px' }}>
                <ForkIcon />
                <p style={{ padding: '0 3px' }}>{obj.forks}</p>
              </div>
              <div style={{ display: 'flex', marginRight: '5px' }}>
                <UpdateIcon />
                <p>{obj.updatedAt}</p>
              </div>
            </div>
          </div>
          <Contributors
            contributions={contributions}
            fullName={obj.fullName}
            dispatch={dispatch}
          />
        </div>
      </div>
    );
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.obj, nextProps.obj) &&
      isEqualObjects(prevProps.contributions, nextProps.contributions) &&
      isEqualObjects(prevProps.active, nextProps.active)
    );
  }
);
export default RepoInfo;
