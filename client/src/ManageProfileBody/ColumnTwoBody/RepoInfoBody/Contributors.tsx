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
import { IAction } from '../../../typing/interface';
import { ActionShared } from '../../../store/Shared/reducer';

interface ContributorsProps {
  fullName: string;
  contributions: any;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
}

const useStyles = makeStyles<Theme>(() => ({
  typography: {
    '& .MuiTypography-root': {
      fontSize: '1.5rem',
    },
  },
}));
const Contributors = React.memo<ContributorsProps>(
  ({ contributions, fullName, dispatchShared }) => {
    const classes = useStyles();
    const [openContributors, setOpenContributors] = useState(false);
    const [contributionRepo, setContributionRepo] = useState<any[]>([]);
    useDeepCompareEffect(() => {
      if (contributions.length > 0) {
        const contribution = contributions.find((xx: any) => fullName === xx.fullName);
        if (contribution.data) {
          setContributionRepo(contribution.data);
        } else {
          setContributionRepo(contribution.contributors);
        }
      }
    }, [contributions]);
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
                  return <Contributor key={idx} dispatchShared={dispatchShared} obj={obj} />;
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
    return (
      isEqualObjects(prevProps.fullName, nextProps.fullName) &&
      isEqualObjects(prevProps.contributions, nextProps.contributions)
    );
  }
);
Contributors.displayName = 'Contributors';
export default Contributors;
