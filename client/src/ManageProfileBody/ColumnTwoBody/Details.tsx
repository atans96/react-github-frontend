import React, { useEffect, useRef, useState } from 'react';
import { GoBook } from 'react-icons/go';
import '../../markdown-body.css';
import { CircularProgress } from '@material-ui/core';
import { markdownParsing } from '../../services';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { useLocation } from 'react-router-dom';

interface DetailsProps {
  branch: string;
  fullName: string;
  html_url: string;
  width: number;
}

const Details: React.FC<DetailsProps> = ({ width, branch, fullName, html_url }) => {
  const _isMounted = useRef(true);
  const readmeRef = useRef<HTMLDivElement>(null);
  const [readme, setReadme] = useState('');
  const location = useLocation();

  useEffect(
    () => {
      if (location.pathname === '/profile' || location.pathname === '/detail') {
        _isMounted.current = true;
        markdownParsing(fullName, branch).then((data) => {
          if (data && _isMounted.current) {
            setReadme(data.readme);
          }
        });
        return () => {
          _isMounted.current = false;
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fullName, branch]
  );

  return (
    <div
      ref={readmeRef}
      style={
        width < 1100
          ? { width: `${width - 650}px`, height: '100vh', overflowY: 'auto' }
          : { height: '80vh', overflowY: 'auto' }
      }
    >
      <div className={'readme background-readme'} style={readme === '' ? { width: '100vw' } : {}}>
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
          <a href={html_url}>View on GitHub</a>
        </div>
      </div>
    </div>
  );
};

export default Details;
