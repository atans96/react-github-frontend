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
  handleHeightChange: any;
  width: number;
}

const Details: React.FC<DetailsProps> = ({ width, branch, fullName, html_url, handleHeightChange }) => {
  const _isMounted = useRef(true);
  const readmeRef = useRef<HTMLDivElement>(null);
  const [readme, setReadme] = useState('');
  const location = useLocation();

  useEffect(
    () => {
      if (location.pathname === '/profile' || location.pathname === '/detail') {
        _isMounted.current = true;
        markdownParsing(fullName, branch).then((data) => {
          if (_isMounted.current) {
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
  useEffect(() => {
    if (readmeRef?.current && readme !== '' && location.pathname === '/profile') {
      setTimeout(() => {
        //because it takes time to render, we need to setTimeout to wait a little bit to determine the full height
        if (readmeRef?.current) {
          handleHeightChange(`${readmeRef.current.offsetHeight}px`);
        }
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readmeRef.current, readme]);

  return (
    <div ref={readmeRef} style={width < 1100 ? { width: `${width - 650}px` } : {}}>
      <div className={'readme background-readme'} style={readme === '' ? { width: '100vw' } : {}}>
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
          <a href={html_url}>View on GitHub</a>
        </div>
      </div>
    </div>
  );
};

export default Details;
