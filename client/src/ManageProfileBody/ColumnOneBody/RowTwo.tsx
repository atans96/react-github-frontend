import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { CircularProgress, List } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import LanguageStarsInfo from './RowTwoBody/LanguageStarsInfo';
import { Counter, fastFilter, isEqualObjects, readEnvironmentVariable } from '../../util';
import { useApolloFactory } from '../../hooks/useApolloFactory';
import useDeepCompareEffect from '../../hooks/useDeepCompareEffect';
import { getTopContributors, getUser } from '../../services';
import moment from 'moment';
import { epochToJsDate } from '../../util/util';
import { IAction, IState, IStateShared } from '../../typing/interface';
import { ActionManageProfile } from '../../store/ManageProfile/reducer';
import { ActionShared } from '../../store/Shared/reducer';

interface RowTwoProps {
  handleLanguageFilter: (args?: string) => void;
  dispatchManageProfile: React.Dispatch<IAction<ActionManageProfile>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
  state: IStateShared;
}

const RowTwo = React.memo<RowTwoProps>(
  ({ handleLanguageFilter, dispatchManageProfile, dispatchShared, state }) => {
    const [languageStarsInfo, setLanguageStarsInfo] = useState<any[]>([]);
    const displayName: string | undefined = (RowTwo as React.ComponentType<any>).displayName;
    const { userData } = useApolloFactory(displayName!).query.getUserData();
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState('');
    const { userInfoData, userInfoDataLoading, userInfoDataError } = useApolloFactory(
      displayName!
    ).query.getUserInfoData();
    const onClickLanguageStarInfo = (e: React.MouseEvent) => (language: string, clicked: boolean) => {
      e.preventDefault();
      if (clicked) {
        handleLanguageFilter(language);
      } else {
        handleLanguageFilter();
      }
    };
    useEffect(() => {
      if (
        !userInfoDataLoading &&
        !userInfoDataError &&
        userInfoData &&
        userInfoData.getUserInfoData &&
        userInfoData.getUserInfoData.repoContributions.length > 0
      ) {
        dispatchManageProfile({
          type: 'REPO_INFO_ADDED',
          payload: {
            repoInfo: userInfoData.getUserInfoData.repoInfo,
          },
        });
        dispatchManageProfile({
          type: 'CONTRIBUTORS_ADDED',
          payload: {
            contributors: userInfoData.getUserInfoData.repoContributions,
          },
        });
        setIsLoading(false);
        const languages = Object.entries(Counter(userInfoData.getUserInfoData.languages));
        const sortedLanguages = languages.sort((a, b) => {
          return b[1] - a[1];
        });
        setLanguageStarsInfo(sortedLanguages);
      }
    }, [userInfoData, userInfoDataLoading, userInfoDataError]);

    const consumers = useApolloFactory(displayName!).consumers().consumers;
    const alreadyFetch = useRef(false);
    useDeepCompareEffect(() => {
      if (
        state.fetchDataPath !== '' &&
        consumers[displayName!] &&
        consumers[displayName!].includes(state.fetchDataPath) &&
        !alreadyFetch.current
      ) {
        alreadyFetch.current = true;
        (async () => {
          let isApiExceeded = false;
          const promises: Promise<any>[] = [];
          await getUser(
            userData?.getUserData?.userName,
            +readEnvironmentVariable('QUERY_GITHUB_API')!,
            1,
            userData && userData.getUserData ? userData.getUserData.token : '',
            true
          ).then((data) => {
            if (data && data.error_403) {
              isApiExceeded = true;
              setNotification('Sorry, API rate limit exceeded.');
            } else if (data?.dataOne?.length > 0) {
              const temp = data.dataOne.reduce(
                (acc: any, obj: any) => {
                  const ja = Object.assign(
                    {},
                    {
                      fullName: obj.full_name,
                      description: obj.description,
                      stars: obj.stargazers_count,
                      forks: obj.forks,
                      updatedAt: moment(obj.updated_at).fromNow(),
                      language: obj.language ? obj.language : 'No Language',
                      topics: obj.topics,
                      defaultBranch: obj.default_branch,
                      html_url: obj.html_url,
                    }
                  );
                  return {
                    ...acc,
                    data: acc.data.concat(ja),
                    languages: acc.languages.concat(obj.language ? obj.language : 'No Language'),
                  };
                },
                { languages: [], data: [] }
              );
              temp.data.forEach((obj: any) => {
                promises.push(
                  new Promise<any>((resolve, reject) => {
                    (async () => {
                      let timeout = 0;
                      let breakout = false;
                      let i = 0;
                      while (
                        // @ts-ignore
                        (await new Promise((resolve) => setTimeout(() => resolve(i++), timeout * 1000))) < 1000 &&
                        !breakout
                      ) {
                        if (timeout > 0) {
                          timeout = 0; //clear the timeout
                        }
                        await getTopContributors(obj.fullName, userData.getUserData.token)
                          .then((res) => {
                            if (res.error_403) {
                              timeout = epochToJsDate(res.rateLimit.reset);
                            } else {
                              breakout = true;
                              resolve(res);
                            }
                          })
                          .catch((err) => reject(err));
                      }
                    })();
                  })
                );
                return obj;
              });
              dispatchShared({
                type: 'NO_DATA_FETCH',
                payload: { path: '' },
              });
              dispatchManageProfile({
                type: 'REPO_INFO_ADDED',
                payload: {
                  repoInfo: temp.data,
                },
              });
              setIsLoading(false);
              const languages = Object.entries(Counter(temp.languages));
              const sortedLanguages = languages.sort((a, b) => {
                return b[1] - a[1];
              });
              setLanguageStarsInfo(sortedLanguages);
            }
          });
          if (!isApiExceeded) {
            Promise.allSettled(promises)
              .then((result) => {
                const temp = result.map((obj: any) => {
                  if (obj.status === 'fulfilled') {
                    return obj.value.data;
                  }
                });
                dispatchManageProfile({
                  type: 'CONTRIBUTORS_ADDED',
                  payload: {
                    contributors: [...fastFilter((x: any) => !!x, temp)],
                  },
                });
              })
              .catch((err) => {
                console.log(err);
              });
          }
        })().catch((err: any) => {
          console.log(err);
          throw new Error(`Something wrong at ${displayName}`);
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.fetchDataPath, consumers, alreadyFetch.current]);

    return (
      <List>
        <If condition={isLoading}>
          <Then>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p>
                Fetching user data<span className="one">.</span>
                <span className="two">.</span>
                <span className="three">.</span>
              </p>
            </div>
          </Then>
        </If>
        <If condition={!isLoading && Object.keys(languageStarsInfo)[0] !== ''}>
          <Then>
            <React.Fragment>
              <table
                style={{
                  marginLeft: '5px',
                  display: 'table',
                  width: '100%',
                  borderCollapse: 'separate',
                  borderSpacing: '0 1em',
                }}
              >
                <thead>
                  {languageStarsInfo.map((languageStar, idx) => {
                    return (
                      <LanguageStarsInfo
                        languageStar={languageStar}
                        key={idx}
                        onClickLanguageStarInfo={onClickLanguageStarInfo}
                      />
                    );
                  })}
                </thead>
              </table>
              <div style={{ textAlign: 'center' }}>
                <p>{notification}</p>
              </div>
            </React.Fragment>
          </Then>
        </If>
      </List>
    );
  },
  (prevProps: any, nextProps: any) => {
    return isEqualObjects(prevProps.state, nextProps.state);
  }
);
RowTwo.displayName = 'LanguageStars';
export default RowTwo;
