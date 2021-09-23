import { useUserCardStyles } from '../../../DiscoverBody/CardDiscoverBody/UserCardStyle';
import React from 'react';
import HistoryIcon from '@material-ui/icons/History';
import { Typography } from '@material-ui/core';
import { If } from '../../../../util/react-if/If';
import { Then } from '../../../../util/react-if/Then';
import { LoadingSmall } from '../../../LoadingSmall';
import Loadable from 'react-loadable';
import Empty from '../../../Layout/EmptyLayout';
import { fastFilter } from '../../../../util';

const Result = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "SearchesHistoriesResult" */ './Result'),
});
interface SearchHistories {
  searches: string[];
  valueRef: string;
  getRootProps: any;
  width: number;
  isLoading: boolean;
  stateSearchUsers: Array<{ [x: string]: string }>;
}

const Child = ({ newBody = '' }) => {
  const classes = useUserCardStyles({ avatarSize: 20 });
  return (
    <div className={classes.wrapper} style={{ borderBottom: 0 }}>
      <HistoryIcon style={{ transform: 'scale(1.5)' }} />
      <div className={classes.nameWrapper}>
        <Typography variant="subtitle2" className={classes.typography}>
          <div dangerouslySetInnerHTML={{ __html: newBody }} />
        </Typography>
      </div>
    </div>
  );
};
const Child1 = ({ result }: any) => {
  const classes = useUserCardStyles({ avatarSize: 20 });
  return (
    <div className={classes.wrapper} style={{ borderBottom: 0 }}>
      <img alt="avatar" className="avatar-img" src={Object.values(result).toString()} />
      <div className={classes.nameWrapper}>
        <Typography variant="subtitle2" className={classes.typography}>
          {Object.keys(result)}
        </Typography>
      </div>
    </div>
  );
};
const SearchHistories: React.FC<SearchHistories> = ({
  searches,
  valueRef,
  getRootProps,
  stateSearchUsers,
  isLoading,
  width,
}) => {
  const size = {
    width: '500px',
    minWidth: '100px',
    maxWidth: '100%',
  };
  let style: React.CSSProperties;
  if (width < 711) {
    style = { width: `${width - 200}px` };
  } else {
    style = {
      maxWidth: size.maxWidth,
      width: size.width,
      minWidth: size.minWidth,
    };
  }

  return (
    <div className="resultsContainer" style={style}>
      <ul className={'results'}>
        {searches.map((search: string, idx: number) => {
          const newBody = search.replace(
            new RegExp(valueRef.toLowerCase(), 'gi'),
            (match: string) => `<mark style="background: #2769AA; color: white;">${match}</mark>`
          );
          return (
            <Result key={idx} getRootProps={getRootProps} userName={search}>
              {() => <Child newBody={newBody} />}
            </Result>
          );
        })}
        <If condition={isLoading}>
          <Then>
            <li className={'clearfix'}>
              <LoadingSmall />
            </li>
          </Then>
        </If>
        <If condition={!isLoading}>
          <Then>
            {fastFilter((search: Array<{ search: string; count: number; updatedAt: Date }>) => {
              return !searches.includes(Object.keys(search)[0]);
            }, stateSearchUsers).map((result, idx) => (
              <Result key={idx} getRootProps={getRootProps} userName={Object.keys(result).toString()}>
                {() => <Child1 result={result} />}
              </Result>
            ))}
          </Then>
        </If>
      </ul>
    </div>
  );
};
SearchHistories.displayName = 'SearchHistories';
export default SearchHistories;
