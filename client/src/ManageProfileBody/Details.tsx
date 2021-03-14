import React, { useEffect, useRef, useState } from 'react';
import { GoBook } from 'react-icons/go';
import '../markdown-body.css';
import { CircularProgress } from '@material-ui/core';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
import { markdownParsing } from '../services';
import { Header, DetailsStyle, Body, Footer, Section } from '../style/DetailsStyle';

interface DetailsProps {
  branch: string;
  fullName: string;
  html_url: string;
  handleHeightChange: any;
  width: number;
}

const Details: React.FC<DetailsProps> = ({ width, branch, fullName, html_url, handleHeightChange }) => {
  const _isMounted = useRef(true);
  const readmeRef = useRef<HTMLDivElement>(null);
  const [readme, setReadme] = useState('');
  useEffect(
      () => {
        _isMounted.current = true;
        markdownParsing(fullName, branch).then((data) => {
          if (_isMounted.current) {
            setReadme(data.readme);
          }
        });
        return () => {
          _isMounted.current = false;
        };
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [fullName, branch]
  );
  useEffect(() => {
    if (readmeRef?.current && readme !== '') {
      setTimeout(() => {
        //because it takes time to render, we need to setTimeout to wait a little bit to determine the full height
        if (readmeRef?.current) {
          handleHeightChange(`${readmeRef.current.offsetHeight}px`);
        }
      }, 1500);
    }
  }, [readmeRef.current, readme]);

  return (
      <div ref={readmeRef} style={width < 1100 ? { width: `${width - 650}px` } : {}}>
        <DetailsStyle className="readme">
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
            <a href={html_url}>View on GitHub</a>
          </Footer>
        </DetailsStyle>
      </div>
  );
};

export default Details;
