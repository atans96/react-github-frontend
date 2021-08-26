import { useHistory, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { markdownParsing } from '../services';
import { GoBook } from 'react-icons/go';
import './markdown-body.css';
import { Then } from '../util/react-if/Then';
import { If } from '../util/react-if/If';
import { CircularProgress } from '@material-ui/core';
import { TrendsCard } from './DetailsBody/TrendsCard';
import { Nullable, starRanking } from '../typing/type';
import './Details.scss';
import NotFoundLayout from './Layout/NotFoundLayout';
import { useQuery } from '@apollo/client';
import { GET_STAR_RANKING } from '../graphql/queries';

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

const Details = () => {
  const abortController = new AbortController();
  const location = useLocation<any>();
  const [readme, setReadme] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [data, setData] = useState<Nullable<StateProps>>(null);
  const [dataStarRanking, setDataStarRanking] = useState<any>();
  const {
    data: starRankingData,
    loading: starRankingDataLoading,
    error: starRankingDataError,
  } = useQuery(GET_STAR_RANKING, {
    context: { clientName: 'mongo' },
  });

  const isStarRankingExist = !starRankingDataLoading && !starRankingDataError && starRankingData?.getStarRanking;

  useEffect(() => {
    let isFinished = false;
    if (isStarRankingExist && !isFinished && /detail/.test(location.pathname) && !!data) {
      const temp = starRankingData.getStarRanking.starRanking.find((obj: starRanking) => obj.id === data.data.id);
      if (!!temp && !isFinished) {
        setDataStarRanking(temp);
      }
    }
    return () => {
      isFinished = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starRankingData, starRankingDataLoading, starRankingDataError]);

  useEffect(() => {
    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    let isFinished = false;
    if (!isFinished && /detail/.test(location.pathname)) {
      if (location.state) {
        setData(JSON.parse(location.state));
      } else {
        setData(JSON.parse(localStorage.getItem('detailsData') || ''));
        localStorage.removeItem('detailsData');
      }
    }
    return () => {
      isFinished = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(
    () => {
      let isFinished = false;
      if (!isFinished && /detail/.test(location.pathname) && !!data) {
        markdownParsing(data.data.full_name, data.data.default_branch, abortController.signal)
          .then((readme) => {
            if (abortController.signal.aborted) {
              return;
            }
            if (!isFinished && readme.error_404) {
              setNotFound(true);
            } else if ((!isFinished && readme.error_401) || readme.error_403) {
              throw new Error(readme);
            } else if (!isFinished && readme && !isFinished) {
              setReadme(readme.readme);
            }
          })
          .catch((e) => new Error(e));
      }
      return () => {
        isFinished = true;
      };
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
          e.stopPropagation();
          e.stopPropagation();
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
              <If condition={readme === '' && notFound}>
                <Then>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <NotFoundLayout marginTop={'0rem'} />
                  </div>
                </Then>
              </If>
              <If condition={readme === '' && !notFound}>
                <Then>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                  </div>
                </Then>
              </If>
            </div>
            <div className={'footer'}>
              <a href={data?.data?.html_url} onClick={() => window.open(data?.data?.html_url)} target="_blank">
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
export default React.memo(Details);
