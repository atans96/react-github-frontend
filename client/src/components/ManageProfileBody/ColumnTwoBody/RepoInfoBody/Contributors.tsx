import React, { useState } from 'react';
import { Collapse } from '@material-ui/core';
import useDeepCompareEffect from '../../../../hooks/useDeepCompareEffect';
import { If } from '../../../../util/react-if/If';
import { Then } from '../../../../util/react-if/Then';
import { useTrackedStateManageProfile } from '../../../../selectors/stateContextSelector';
import { ContributorProps, ContributorsProps } from '../../../../typing/type';
import { useLocation } from 'react-router-dom';
import Loadable from 'react-loadable';
import Empty from '../../../Layout/EmptyLayout';
import { useDeepMemo } from '../../../../hooks/useDeepMemo';

const Contributor = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "Contributor" */ './ContributorsBody/Contributor'),
});

interface Props {
  fullName: string;
  openContributors: boolean;
}

const Contributors: React.FC<Props> = ({ fullName, openContributors }) => {
  const [contributionRepo, setContributionRepo] = useState<ContributorProps[]>([]);
  const [stateManageProfile] = useTrackedStateManageProfile();
  const location = useLocation();
  useDeepCompareEffect(() => {
    let isFinished = false;
    if (stateManageProfile.contributors.length > 0 && location.pathname === '/profile' && !isFinished) {
      const contribution = stateManageProfile.contributors.find((xx: ContributorsProps) => fullName === xx.fullName);
      if (contribution && !isFinished) {
        setContributionRepo(contribution.contributors);
      }
      return () => {
        isFinished = true;
      };
    }
  }, [stateManageProfile.contributors]);

  return (
    <React.Fragment>
      <If condition={contributionRepo.length > 0}>
        <Then>
          <Collapse in={openContributors} timeout={0.1} unmountOnExit>
            <div style={{ display: 'flex', flexFlow: 'wrap', justifyContent: 'center' }}>
              {useDeepMemo(() => {
                return contributionRepo.map((obj, idx) => <Contributor key={idx} obj={obj} />);
              }, [contributionRepo])}
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
};
Contributors.displayName = 'Contributors';
export default Contributors;
