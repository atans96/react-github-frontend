import { useHistory, useLocation } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { markdownParsing } from './services';
import { Body, DetailsLayout, Footer, Header, Section } from './Layout/DetailsLayout';
import styled from 'styled-components';
import { GoBook } from 'react-icons/go';
import './markdown-body.css';
import { Then } from './util/react-if/Then';
import { If } from './util/react-if/If';
import { CircularProgress } from '@material-ui/core';
import { TrendsCard } from './HomeBody/DetailsBody/TrendsCard';
import { Helmet } from 'react-helmet';
import { useApolloFactorySelector } from './selectors/stateSelector';

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

const GithubLink = styled.a``;
const Details: React.FC = () => {
  const _isMounted = useRef(true);
  const [readme, setReadme] = useState('');
  const [data, setData] = useState(undefined);
  let history = useHistory();
  let location = useLocation<StateProps>();
  const { starRankingData, starRankingDataLoading, starRankingDataError } = useApolloFactorySelector(
    (query: any) => query.getStarRanking
  );
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

  return (
    <React.Fragment>
      <Helmet>
        <title>{location.state.data.full_name}</title>
        <meta name="description" content={`Github Readme for ${location.state.data.full_name}`} />
      </Helmet>
      <div
        className="background-details"
        onClick={(e) => {
          e.preventDefault();
          if (e.target === e.currentTarget) {
            const path = location.state.path === '/' ? '/' : '/discover';
            history.push(path);
          }
        }}
      >
        <div id="main-content" className="details-container">
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
          <DetailsLayout className="readme">
            <Header>
              <GoBook className="icon" size={20} />
              README
            </Header>
            <Body>
              <If condition={readme !== ''}>
                <Then>
                  <Section>
                    <div dangerouslySetInnerHTML={{ __html: readme }} />
                  </Section>
                </Then>
              </If>
              <If condition={readme === ''}>
                <Then>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                  </div>
                </Then>
              </If>
            </Body>
            <Footer>
              <GithubLink href={location.state.data.html_url}>View on GitHub</GithubLink>
            </Footer>
          </DetailsLayout>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Details;
