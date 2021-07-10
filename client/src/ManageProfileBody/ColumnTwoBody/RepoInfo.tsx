import React, { useState } from 'react';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import UpdateIcon from '@material-ui/icons/Update';
import { ForkIcon } from '../../util/icons';
import { RepoInfoProps } from '../../typing/type';
import { ListItem, ListItemIcon, ListItemText, Theme } from '@material-ui/core';
import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useTrackedStateShared } from '../../selectors/stateContextSelector';
import Loadable from 'react-loadable';
import { useStableCallback } from '../../util';
import Empty from '../../Layout/EmptyLayout';

const Contributors = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "Contributors" */ './RepoInfoBody/Contributors'),
});

interface Props {
  obj: RepoInfoProps;
  onClickRepoInfo: any;
  active: string;
}

const useStyles = makeStyles<Theme>(() => ({
  typography: {
    '& .MuiTypography-root': {
      fontSize: '1.5rem',
    },
  },
}));
const RepoInfo: React.FC<Props> = ({ obj, onClickRepoInfo, active }) => {
  const [openContributors, setOpen] = useState(false);
  const handleClick = useStableCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setOpen((prevState) => !prevState);
  });
  const classes = useStyles();
  const [stateShared] = useTrackedStateShared();
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
            <div
              style={{
                marginBottom: '5px',
              }}
            >
              <ul
                style={{
                  width: 'fit-content',
                  padding: '2px 1em',
                  borderRadius: '5px',
                  backgroundColor: stateShared.githubLanguages.get(obj?.language?.replace(/\+\+|#|\s/, '-'))?.color,
                }}
                className={`language`}
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
        <React.Fragment>
          <ListItem button key={`${openContributors ? 'Hide' : 'Show'} Top Contributors`} onClick={handleClick}>
            <ListItemIcon>
              <PeopleOutlineIcon style={{ transform: 'scale(1.5)' }} />
            </ListItemIcon>
            <ListItemText
              primary={`${openContributors ? 'Hide' : 'Show'} Top Contributors`}
              className={classes.typography}
            />
            {openContributors ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          {openContributors && <Contributors fullName={obj.fullName} openContributors={openContributors} />}
        </React.Fragment>
      </div>
    </div>
  );
};

RepoInfo.displayName = 'RepoInfo';
export default RepoInfo;
