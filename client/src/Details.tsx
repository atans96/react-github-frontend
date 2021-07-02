import { Redirect, useLocation } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { markdownParsing } from './services';
import { GoBook } from 'react-icons/go';
import './markdown-body.css';
import { Then } from './util/react-if/Then';
import { If } from './util/react-if/If';
import { CircularProgress } from '@material-ui/core';
import { TrendsCard } from './DetailsBody/TrendsCard';
import { useHistory } from 'react-router-dom';
import { useSelector } from './selectors/stateSelector';
import { StaticState } from './typing/interface';
import { Nullable, starRanking } from './typing/type';
import { createRenderElement } from './Layout/MasonryLayout';
import KeepMountedLayout from './Layout/KeepMountedLayout';
import { Location } from 'history';

interface StateProps {
  data: {
    full_name: string;
    default_branch: string;
    html_url: string;
    description: string;
    id: number;
    owner: {
      login: string;
    };
  };
  path: string;
}
const Details: React.FC = ({ location }: any) => {
  const _isMounted = useRef(true);
  const [readme, setReadme] = useState('');
  const [data, setData] = useState<Nullable<StateProps>>(null);
  const [dataStarRanking, setDataStarRanking] = useState<any>();
  const { starRankingData, starRankingDataLoading, starRankingDataError } = useSelector(
    (state: StaticState) => state.StarRanking
  );

  const isStarRankingExist = !starRankingDataLoading && !starRankingDataError && starRankingData.getStarRanking;

  useEffect(() => {
    let isFinished = false;
    if (isStarRankingExist && !isFinished && /detail/.test(location.pathname) && !!data) {
      const temp = starRankingData.getStarRanking.starRanking.find((obj: starRanking) => obj.id === data.data.id);
      if (!!temp) {
        setDataStarRanking(temp);
      }
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starRankingData, starRankingDataLoading, starRankingDataError]);

  useEffect(() => {
    let isFinished = false;
    if (!isFinished && /detail/.test(location.pathname)) {
      if (location.state) {
        setData(JSON.parse(location.state));
      } else {
        setData(JSON.parse(localStorage.getItem('detailsData') || ''));
        localStorage.removeItem('detailsData');
      }
      return () => {
        setData(null);
        setReadme('');
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(
    () => {
      let isFinished = false;
      if (!isFinished && /detail/.test(location.pathname) && !!data) {
        markdownParsing(data.data.full_name, data.data.default_branch).then((dataStarRanking) => {
          if (_isMounted.current) {
            setReadme(dataStarRanking.readme);
          }
        });
        return () => {
          isFinished = true;
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );
  const history = useHistory();
  return (
    <React.Fragment>
      <div
        className={'background-readme-details'}
        onClick={(e) => {
          e.preventDefault();
          if (e.target === e.currentTarget) {
            const path = data?.path === '/' ? '/' : '/discover';
            history.push(path);
          }
        }}
      >
        <div className={'background-container'} id="main-content">
          <If condition={!!dataStarRanking}>
            <Then>
              <div className="readme">
                <TrendsCard project={dataStarRanking} />
              </div>
            </Then>
          </If>
          <div className={'readme background-readme'}>
            <div className={'header-details'}>
              <GoBook className="icon" size={20} />
              README
            </div>
            <div>
              <If condition={readme !== ''}>
                <Then>
                  <div className={'section'}>
                    <div dangerouslySetInnerHTML={{ __html: readme }} />
                  </div>
                </Then>
              </If>
              <If condition={readme === ''}>
                <Then>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                  </div>
                </Then>
              </If>
            </div>
            <div className={'footer'}>
              <a href={data?.data?.html_url} target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
Details.displayName = 'Details';
const DetailsRender = ({ isLoggedIn = false }) => {
  const location = useLocation<Location>();
  return (
    <KeepMountedLayout
      mountedCondition={/detail/.test(location.pathname)}
      render={() => {
        if (isLoggedIn) {
          return createRenderElement(Details, { location });
        } else {
          return <Redirect to={'/login'} from={'/detail/:id'} />;
        }
      }}
    />
  );
};
export default DetailsRender;
