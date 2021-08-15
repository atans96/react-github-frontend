import React from 'react';
import { Typography } from '@material-ui/core';
import { useUserCardStyles } from '../../DiscoverBody/CardDiscoverBody/UserCardStyle';
import { Then } from '../../../util/react-if/Then';
import { If } from '../../../util/react-if/If';
import { Else } from '../../../util/react-if/Else';
import { LoadingSmall } from '../../LoadingSmall';
import Loadable from 'react-loadable';
import Empty from '../../Layout/EmptyLayout';

const Result = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "Result" */ './ResultsBody/Result'),
});
interface Searches {
  isLoading: boolean;
  style: React.CSSProperties;
  data: { [key: string]: string }[];
  getRootProps: any;
}
const Child = ({ result }: any) => {
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
const Searches: React.FC<Searches> = ({ data, isLoading, style, getRootProps }) => {
  return (
    <>
      <If condition={isLoading}>
        <Then>
          <div className="resultsContainer" style={style}>
            <ul className={'results'}>
              <li className={'clearfix'}>
                <LoadingSmall />
              </li>
            </ul>
          </div>
        </Then>
      </If>

      <If condition={!isLoading}>
        <Then>
          <div className="resultsContainer" style={style}>
            <If condition={data && data.length > 0}>
              <Then>
                <ul className={'results'}>
                  {data.map((result, idx) => (
                    <Result key={idx} userName={Object.keys(result).toString()} getRootProps={getRootProps}>
                      {() => <Child result={result} />}
                    </Result>
                  ))}
                </ul>
              </Then>

              <Else>
                <ul className={'results'}>
                  <li className={'clearfix'}>No Result Found</li>
                </ul>
              </Else>
            </If>
          </div>
        </Then>
      </If>
    </>
  );
};
Searches.displayName = 'Searches';
export default Searches;
