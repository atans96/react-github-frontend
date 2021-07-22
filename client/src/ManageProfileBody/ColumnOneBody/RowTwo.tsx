import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { CircularProgress, List } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import LanguageStarsInfo from './RowTwoBody/LanguageStarsInfo';
import { Counter, fastFilter, readEnvironmentVariable } from '../../util';
import { useApolloFactory } from '../../hooks/useApolloFactory';
import useDeepCompareEffect from '../../hooks/useDeepCompareEffect';
import { getTopContributors, getUser } from '../../services';
import moment from 'moment';
import { epochToJsDate } from '../../util/util';
import { MergedDataProps } from '../../typing/type';
import { useLocation } from 'react-router-dom';

import { useTrackedStateManageProfile, useTrackedStateShared } from '../../selectors/stateContextSelector';
import { LocationGraphQL } from '../../typing/interface';

interface RowTwoProps {
  handleLanguageFilter: (...args: any) => void;
}

let axiosCancel = false;
const RowTwo: React.FC<RowTwoProps> = ({ handleLanguageFilter }) => {
  const [, dispatchManageProfile] = useTrackedStateManageProfile();
  const [stateShared] = useTrackedStateShared();
  const location = useLocation<LocationGraphQL>();
  const [languageStarsInfo, setLanguageStarsInfo] = useState<any[]>([]);
  const displayName: string = (RowTwo as React.ComponentType<any>).displayName || '';
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState('');

  const onClickLanguageStarInfo = (e: React.MouseEvent) => (language: string, clicked: boolean) => {
    e.preventDefault();
    if (clicked) {
      handleLanguageFilter(language);
    } else {
      handleLanguageFilter(language, true);
    }
  };

  useDeepCompareEffect(() => {
    let isFinished = false;
    if (
      !isFinished &&
      location?.state?.data?.userInfoData.getUserInfoData.repoContributions.length > 0 &&
      location.pathname === '/profile'
    ) {
      dispatchManageProfile({
        type: 'REPO_INFO_ADDED',
        payload: {
          repoInfo: location.state.data.userInfoData.getUserInfoData.repoInfo,
        },
      });
      dispatchManageProfile({
        type: 'CONTRIBUTORS_ADDED',
        payload: {
          contributors: location.state.data.userInfoData.getUserInfoData.repoContributions,
        },
      });
      setIsLoading(false);
      const languages = Object.entries(Counter(location.state.data.userInfoData?.getUserInfoData?.languages ?? []));
      setLanguageStarsInfo(languages);
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.state?.data?.userInfoData]);

  const consumers = useApolloFactory(displayName!).consumers().consumers;
  const alreadyFetch = useRef(false);
  const abortController = new AbortController();
  useDeepCompareEffect(() => {
    if (
      stateShared.fetchDataPath !== '' &&
      consumers[displayName!] &&
      consumers[displayName!].includes(stateShared.fetchDataPath) &&
      !alreadyFetch.current &&
      location.pathname === '/profile'
    ) {
      alreadyFetch.current = true;
      (async () => {
        let isApiExceeded = false;
        const promises: Promise<any>[] = [];
        // await getUser({
        //   signal: abortController.signal,
        //   username: location?.state?.data?.userData?.getUserData?.userName,
        //   perPage: +readEnvironmentVariable('QUERY_GITHUB_API')!,
        //   page: 1,
        //   axiosCancel,
        // }).then((data) => {
        //   if (data && data.error_403) {
        //     isApiExceeded = true;
        //     setNotification('Sorry, API rate limit exceeded.');
        //   } else if (data?.dataOne?.length > 0) {
        //     const temp = data.dataOne.reduce(
        //       (acc: any, obj: MergedDataProps) => {
        //         const ja = Object.assign(
        //           {},
        //           {
        //             fullName: obj.full_name,
        //             description: obj.description,
        //             stars: obj.stargazers_count,
        //             forks: obj.forks,
        //             updatedAt: moment(obj.updated_at).fromNow(),
        //             language: obj.language ? obj.language : 'No Language',
        //             topics: obj.topics,
        //             defaultBranch: obj.default_branch,
        //             html_url: obj.html_url,
        //           }
        //         );
        //         return {
        //           ...acc,
        //           data: acc.data.concat(ja),
        //           languages: acc.languages.concat(obj.language ? obj.language : 'No Language'),
        //         };
        //       },
        //       { languages: [], data: [] }
        //     );
        //     temp.data.forEach((obj: any) => {
        //       promises.push(
        //         new Promise<any>((resolve, reject) => {
        //           (async () => {
        //             let timeout = 0;
        //             let breakout = false;
        //             let i = 0;
        //             while (
        //               // @ts-ignore
        //               (await new Promise((resolve) => setTimeout(() => resolve(i++), timeout * 1000))) < 1000 &&
        //               !breakout
        //             ) {
        //               if (timeout > 0) {
        //                 timeout = 0; //clear the timeout
        //               }
        //               await getTopContributors(obj.fullName)
        //                 .then((res) => {
        //                   if (res) {
        //                     if (res.error_403) {
        //                       timeout = epochToJsDate(res.rateLimit.reset);
        //                     } else {
        //                       breakout = true;
        //                       resolve(res);
        //                     }
        //                   }
        //                 })
        //                 .catch((err) => reject(err));
        //             }
        //           })();
        //         })
        //       );
        //       return obj;
        //     });
        //     dispatchStateShared({
        //       type: 'NO_DATA_FETCH',
        //       payload: { path: '' },
        //     });
        //     dispatchManageProfile({
        //       type: 'REPO_INFO_ADDED',
        //       payload: {
        //         repoInfo: temp.data,
        //       },
        //     });
        //     setIsLoading(false);
        //     const languages = Object.entries(Counter(temp.languages ?? []));
        //     setLanguageStarsInfo(languages);
        //   }
        // });
        // if (!isApiExceeded) {
        //   Promise.allSettled(promises)
        //     .then((result) => {
        //       const temp = result.map((obj: any) => {
        //         if (obj.status === 'fulfilled') {
        //           return obj.value.data;
        //         }
        //       });
        //       dispatchManageProfile({
        //         type: 'CONTRIBUTORS_ADDED',
        //         payload: {
        //           contributors: [...fastFilter((x: any) => !!x, temp)],
        //         },
        //       });
        //     })
        //     .catch((err) => {
        //       console.log(err);
        //     });
        // }
      })().catch((err: any) => {
        console.log(err);
        throw new Error(`Something wrong at ${displayName}`);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateShared.fetchDataPath, consumers, alreadyFetch.current, axiosCancel]);

  useEffect(() => {
    return () => {
      console.log('abort');
      abortController.abort(); //cancel the fetch when the user go away from current page or when typing again to search
      axiosCancel = true;
    };
  }, []);

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
                {React.useMemo(() => {
                  return languageStarsInfo.map((languageStar) => (
                    <LanguageStarsInfo
                      languageStar={languageStar}
                      onClickLanguageStarInfo={onClickLanguageStarInfo}
                      key={languageStar[0]}
                    />
                  ));
                }, [languageStarsInfo.length])}
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
};
RowTwo.displayName = 'LanguageStars';
export default RowTwo;
