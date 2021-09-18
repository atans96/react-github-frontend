import { If } from '../../../util/react-if/If';
import { Then } from '../../../util/react-if/Then';
import { CircularProgress, List } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import LanguageStarsInfo from './RowTwoBody/LanguageStarsInfo';
import { Counter } from '../../../util';
import { useTrackedStateManageProfile } from '../../../selectors/stateContextSelector';
import DbCtx, { useDexieDB } from '../../../db/db.ctx';
import { useApolloClient, useLazyQuery } from '@apollo/client';
import { GET_USER_INFO_DATA } from '../../../graphql/queries';
import { parallel } from 'async';
import { RepoInfo } from '../../../typing/type';

interface RowTwoProps {
  handleLanguageFilter: (...args: any) => void;
}
function cleanString(input: string) {
  let output = '';
  for (let i = 0; i < input.length; i++) {
    if (input.charCodeAt(i) <= 127) {
      output += input.charAt(i);
    }
  }
  return output;
}
let axiosCancel = false;
const RowTwo: React.FC<RowTwoProps> = ({ handleLanguageFilter }) => {
  const [getUserInfoData, { data: userInfoData, loading: userInfoDataLoading, error: userInfoDataError }] =
    useLazyQuery(GET_USER_INFO_DATA, {
      context: { clientName: 'mongo' },
    });
  // const { db } = DbCtx.useContainer();
  const [db, setDb] = useDexieDB();
  const [, dispatchManageProfile] = useTrackedStateManageProfile();
  const [languageStarsInfo, setLanguageStarsInfo] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const onClickLanguageStarInfo = (e: React.MouseEvent) => (language: string, clicked: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (clicked) {
      handleLanguageFilter(language);
    } else {
      handleLanguageFilter(language, true);
    }
  };

  const abortController = new AbortController();

  useEffect(() => {
    let isFinished = false;
    if (db && !isFinished) {
      db.getUserInfoData.get(1).then((data: any) => {
        if (data && !isFinished) {
          const temp = JSON.parse(data.data).getUserInfoData;
          if (temp.repoInfo.length > 0) {
            dispatchManageProfile({
              type: 'REPO_INFO_ADDED',
              payload: {
                repoInfo: temp.repoInfo,
              },
            });
          }
          if (temp.repoContributions.length > 0) {
            dispatchManageProfile({
              type: 'CONTRIBUTORS_ADDED',
              payload: {
                contributors: temp.repoContributions,
              },
            });
          }
          if (temp.languages.length > 0) {
            setIsLoading(false);
            const languages = Object.entries(Counter(temp.languages ?? []));
            setLanguageStarsInfo(languages);
          }
        } else {
          getUserInfoData();
        }
      });
    }
    return () => {
      console.log('abort');
      abortController.abort(); //cancel the fetch when the user go away from current page or when typing again to search
      axiosCancel = true;
      isFinished = true;
    };
  }, [db]);

  const client = useApolloClient();
  useEffect(() => {
    let isFinished = false;
    if (
      !isFinished &&
      !userInfoDataLoading &&
      !userInfoDataError &&
      userInfoData?.getUserInfoData?.repoInfo?.length > 0 &&
      userInfoData?.getUserInfoData?.repoContributions?.length > 0 &&
      userInfoData?.getUserInfoData?.languages?.length > 0
    ) {
      parallel([
        () => {
          dispatchManageProfile({
            type: 'REPO_INFO_ADDED',
            payload: {
              repoInfo: userInfoData?.getUserInfoData?.repoInfo,
            },
          });
        },
        () =>
          dispatchManageProfile({
            type: 'CONTRIBUTORS_ADDED',
            payload: {
              contributors: userInfoData?.getUserInfoData?.repoContributions,
            },
          }),
        () =>
          client.cache.writeQuery({
            query: GET_USER_INFO_DATA,
            data: {
              getUserInfoData: userInfoData?.getUserInfoData,
            },
          }),
        () => {
          const temp = { ...userInfoData?.getUserInfoData };
          temp.repoInfo = temp.repoInfo.map((obj: RepoInfo) => {
            if (obj.description?.length > 0) {
              const objClone = { ...obj };
              return Object.assign(objClone, {
                ...objClone,
                description: cleanString(objClone.description),
                readme: cleanString(objClone.readme),
              });
            } else {
              return obj;
            }
          });
          db?.getUserInfoData?.add(
            {
              data: JSON.stringify({
                getUserInfoData: temp,
              }),
            },
            1
          );
        },
        () => {
          setIsLoading(false);
          const languages = Object.entries(Counter(userInfoData?.getUserInfoData?.languages ?? []));
          setLanguageStarsInfo(languages);
        },
      ]);
    }
    return () => {
      dispatchManageProfile({
        type: 'REMOVE_ALL',
      });
      isFinished = true;
    };
  }, [userInfoDataLoading, userInfoDataError]);

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
        </Then>
      </If>
    </List>
  );
};
RowTwo.displayName = 'LanguageStars';
export default RowTwo;
