import { useLocation } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { markdownParsing } from './services';
import { GoBook } from 'react-icons/go';
import './markdown-body.css';
import { Then } from './util/react-if/Then';
import { If } from './util/react-if/If';
import { CircularProgress } from '@material-ui/core';
import { TrendsCard } from './HomeBody/DetailsBody/TrendsCard';
import { Helmet } from 'react-helmet';
import { useApolloFactory } from './hooks/useApolloFactory';
import { useHistory } from 'react-router';

interface StateProps {
  data: {
    full_name: string;
    default_branch: string;
    html_url: string;
    id: number;
    owner: {
      login: string;
    };
  };
  path: string;
}

const Details: React.FC = () => {
  const _isMounted = useRef(true);
  const [readme, setReadme] = useState('');
  const [data, setData] = useState(undefined);
  const location = useLocation<StateProps>();
  const displayName: string | undefined = (Details as React.ComponentType<any>).displayName;
  const { starRankingData, starRankingDataLoading, starRankingDataError } = useApolloFactory(
    displayName!
  ).query.getStarRanking();
  useEffect(() => {
    if (!starRankingDataLoading && !starRankingDataError && starRankingData && starRankingData?.getStarRanking) {
      const temp = starRankingData.getStarRanking.starRanking.find((obj: any) => obj.id === location.state.data.id);
      if (!!temp) {
        setData(temp);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starRankingData, starRankingDataLoading, starRankingDataError]);
  useEffect(
    () => {
      _isMounted.current = true;
      markdownParsing(location.state.data.full_name, location.state.data.default_branch).then((data) => {
        if (_isMounted.current) {
          setReadme(data.readme);
        }
      });
      return () => {
        _isMounted.current = false;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.state.data]
  );
  const history = useHistory();
  return (
    <React.Fragment>
      <Helmet>
        <title>{location.state.data.full_name}</title>
        <meta name="description" content={`Github Readme for ${location.state.data.full_name}`} />
      </Helmet>
      <div
        className={'background-readme-details'}
        onClick={(e) => {
          e.preventDefault();
          if (e.target === e.currentTarget) {
            const path = location.state.path === '/' ? '/' : '/discover';
            history.push(path);
          }
        }}
      >
        <div className={'background-container'} id="main-content">
          <div>
            {/*TODO: use More Like This query from Elastic Search*/}
            <p>Similar Repo just like {location.state.data.full_name}:</p>
          </div>
          <If condition={!!data}>
            <Then>
              <div className="readme">
                <TrendsCard project={data} />
              </div>
            </Then>
          </If>
          <div className={'readme background-readme'}>
            <div className={'header'}>
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
              <a href={location.state.data.html_url}>View on GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
Details.displayName = 'Details';
export default Details;
