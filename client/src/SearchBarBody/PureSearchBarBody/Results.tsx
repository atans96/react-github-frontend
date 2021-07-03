import React from 'react';
import { Typography } from '@material-ui/core';
import { useUserCardStyles } from '../../DiscoverBody/CardDiscoverBody/UserCardStyle';
import { Then } from '../../util/react-if/Then';
import { If } from '../../util/react-if/If';
import { Else } from '../../util/react-if/Else';
import { LoadingSmall } from '../../LoadingSmall';
import { loadable } from '../../loadable';
import { createRenderElement } from '../../Layout/MasonryLayout';

interface Result {
  children: React.ReactNode;
  userName: string;
  getRootProps: any;
}
const Result = (args: Result) =>
  loadable({
    importFn: () => import('./ResultsBody/Result').then((module) => createRenderElement(module.default, { ...args })),
    cacheId: 'Result',
    empty: () => <></>,
  });
interface Results {
  isLoading: boolean;
  style: React.CSSProperties;
  data: { [key: string]: string }[];
  getRootProps: any;
  ref: React.Ref<HTMLDivElement>;
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
const Results: React.FC<Results> = React.forwardRef(({ data, isLoading, style, getRootProps }, ref) => {
  return (
    <>
      <If condition={isLoading}>
        <Then>
          <div className="resultsContainer" style={style} ref={ref}>
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
          <div className="resultsContainer" style={style} ref={ref}>
            <If condition={data && data.length > 0}>
              <Then>
                <ul className={'results'}>
                  {data.map((result, idx) =>
                    Result({ children: Child({ result }), userName: Object.keys(result).toString(), getRootProps })
                  )}
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
});
Results.displayName = 'Results';
export default Results;
