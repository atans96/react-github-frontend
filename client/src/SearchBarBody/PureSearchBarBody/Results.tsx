import React from 'react';
import Result from './ResultsBody/Result';
import { Typography } from '@material-ui/core';
import { useUserCardStyles } from '../../HomeBody/CardBody/UserCardStyle';
import { Loading } from '../../util';
import { Then } from '../../util/react-if/Then';
import { If } from '../../util/react-if/If';
import { Else } from '../../util/react-if/Else';
import { IAction, IStateShared } from '../../typing/interface';
import { Action } from '../../store/Home/reducer';
import { ActionStargazers } from '../../store/Staargazers/reducer';
import { ActionShared } from '../../store/Shared/reducer';

interface Results {
  isLoading: boolean;
  style: React.CSSProperties;
  data: { [key: string]: string }[];
  getRootProps: any;
  ref: React.Ref<HTMLDivElement>;
  state: IStateShared;
  dispatch: React.Dispatch<IAction<Action>>;
  dispatchStargazer: React.Dispatch<IAction<ActionStargazers>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
}

const avatarSize = 20;
const Results: React.FC<Results> = React.forwardRef(
  ({ state, data, isLoading, style, getRootProps, dispatch, dispatchStargazer, dispatchShared }, ref) => {
    const classes = useUserCardStyles({ avatarSize });
    return (
      <>
        <If condition={isLoading}>
          <Then>
            <div className="resultsContainer" style={style} ref={ref}>
              <ul className={'results'}>
                <li className={'clearfix'}>
                  <Loading />
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
                    {data.map((result, idx) => (
                      <Result
                        state={state}
                        getRootProps={getRootProps}
                        userName={Object.keys(result).toString()}
                        key={idx}
                        dispatch={dispatch}
                        dispatchShared={dispatchShared}
                        dispatchStargazer={dispatchStargazer}
                      >
                        <div className={classes.wrapper} style={{ borderBottom: 0 }}>
                          <img alt="avatar" className="avatar-img" src={Object.values(result).toString()} />
                          <div className={classes.nameWrapper}>
                            <Typography variant="subtitle2" className={classes.typography}>
                              {Object.keys(result)}
                            </Typography>
                          </div>
                        </div>
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
  }
);
Results.displayName = 'Results';
export default Results;
