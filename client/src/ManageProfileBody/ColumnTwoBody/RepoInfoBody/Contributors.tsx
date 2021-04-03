import React, { useState } from 'react';
import { Collapse, ListItem, ListItemIcon, ListItemText, Theme } from '@material-ui/core';
import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { isEqualObjects } from '../../../util';
import useDeepCompareEffect from '../../../hooks/useDeepCompareEffect';
import { If } from '../../../util/react-if/If';
import { Then } from '../../../util/react-if/Then';
import Contributor from './ContributorsBody/Contributor';
import { useTrackedStateManageProfile } from '../../../selectors/stateContextSelector';
import { ContributorProps, ContributorsProps } from '../../../typing/type';
import { useLocation } from 'react-router-dom';

interface Props {
  fullName: string;
}

const useStyles = makeStyles<Theme>(() => ({
  typography: {
    '& .MuiTypography-root': {
      fontSize: '1.5rem',
    },
  },
}));
const Contributors = React.memo<Props>(
  ({ fullName }) => {
    const classes = useStyles();
    const [openContributors, setOpenContributors] = useState(false);
    const [contributionRepo, setContributionRepo] = useState<ContributorProps[]>([]);
    const [stateManageProfile] = useTrackedStateManageProfile();
    const location = useLocation();
    useDeepCompareEffect(() => {
      let isFinished = false;
      if (stateManageProfile.contributors.length > 0 && location.pathname === '/profile' && !isFinished) {
        const contribution = stateManageProfile.contributors.find((xx: ContributorsProps) => fullName === xx.fullName);
        if (contribution) {
          setContributionRepo(contribution.contributors);
        }
        return () => {
          isFinished = true;
        };
      }
    }, [stateManageProfile.contributors]);

    const handleOpenContributors = (e: React.MouseEvent) => {
      e.preventDefault();
      setOpenContributors(!openContributors);
    };

    return (
      <React.Fragment>
        <If condition={contributionRepo.length > 0}>
          <Then>
            <ListItem
              button
              key={`${openContributors ? 'Hide' : 'Show'} Top Contributors`}
              onClick={handleOpenContributors}
            >
              <ListItemIcon>
                <PeopleOutlineIcon style={{ transform: 'scale(1.5)' }} />
              </ListItemIcon>
              <ListItemText
                primary={`${openContributors ? 'Hide' : 'Show'} Top Contributors`}
                className={classes.typography}
              />
              {openContributors ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openContributors} timeout={0.1} unmountOnExit>
              <div style={{ display: 'flex', flexFlow: 'wrap', justifyContent: 'center' }}>
                {contributionRepo.map((obj, idx) => {
                  return <Contributor key={idx} obj={obj} />;
                })}
              </div>
            </Collapse>
          </Then>
        </If>
        <If condition={contributionRepo.length === 0}>
          <Then>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <h6>
                Loading Contributors data<span className="one">.</span>
                <span className="two">.</span>
                <span className="three">.</span>
              </h6>
            </div>
          </Then>
        </If>
      </React.Fragment>
    );
  },
  (prevProps: any, nextProps: any) => {
    return isEqualObjects(prevProps.fullName, nextProps.fullName);
  }
);
Contributors.displayName = 'Contributors';
export default Contributors;
