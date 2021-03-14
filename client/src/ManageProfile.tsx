import React, { useCallback, useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { getTopContributors, getUser } from './services';
import {
  Checkbox,
  CircularProgress,
  Collapse,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  FormGroup,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Theme,
} from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import { Counter, fastFilter, readEnvironmentVariable } from './util';
import useDeepCompareEffect from './hooks/useDeepCompareEffect';
import { If } from './util/react-if/If';
import { Then } from './util/react-if/Then';
import moment from 'moment';
import LanguageStarsInfo from './ManageProfileBody/LanguageStarsInfo';
import RepoInfo from './ManageProfileBody/RepoInfo';
import Details from './ManageProfileBody/Details';
import { IState } from './typing/interface';
import { RepoInfoProps } from './typing/type';
import { epochToJsDate } from './util/util';
import Checkboxes from './ManageProfileBody/Checkboxes';
import Search from './ManageProfileBody/Search';
import _ from 'lodash';
import { useResizeHandler } from './hooks/hooks';
import { useApolloFactory } from './hooks/useApolloFactory';

interface StyleProps {
  drawerWidth: string;
}

const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  root: {
    display: 'flex',
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: (props) => props.drawerWidth,
    flexShrink: 0,
    zIndex: 1,
    whiteSpace: 'nowrap',
    '& .MuiDrawer-paper': {
      zIndex: -1,
      boxShadow: '3px 0 5px -2px #888',
      background: 'var(--background-theme-color)',
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '74px',
    marginTop: theme.spacing.length,
    justifyContent: 'flex-end',
    padding: '0 8px',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.length * 3,
  },
  grow: {
    flexGrow: 1,
  },
  typography: {
    '& .MuiTypography-root': {
      fontSize: '1.5rem',
    },
  },
  formControl: {
    margin: theme.spacing(3),
  },
}));

interface ManageProfileProps {
  state: IState;
  dispatch: any;
}

const ManageProfile = React.memo<ManageProfileProps>(({ state, dispatch }) => {
  const { userData, userDataLoading, userDataError } = useApolloFactory().query.getUserData;
  const { userInfoData, userInfoDataLoading, userInfoDataError } = useApolloFactory().query.getUserInfoData;
  const languagesPreferenceAdded = useApolloFactory().mutation.languagesPreferenceAdded;
  const [openLanguages, setOpenLanguages] = useState(false);
  const classes = useStyles({ drawerWidth: '250px' });
  const handleOpenLanguages = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenLanguages(!openLanguages);
  };
  const [active, setActive] = useState('');
  const [height, setHeight] = useState('100vh');
  const [fullName, setFullName] = useState('');
  const [branch, setBranch] = useState('');
  const [htmlUrl, setHtmlUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string[]>([]);
  const [languageStarsInfo, setLanguageStarsInfo] = useState<any[]>([]);
  const [languagePreferences, setLanguagePreferences] = useState([] as any);

  useEffect(() => {
    if (!userDataLoading && !userDataError && userData?.getUserData?.languagePreference?.length > 0) {
      setLanguagePreferences(userData.getUserData.languagePreference);
    }
  }, [userDataLoading, userDataError, userData]);

  useDeepCompareEffect(() => {
    if (state.isLoggedIn) {
      languagesPreferenceAdded({
        variables: {
          languagePreference: languagePreferences,
        },
      }).then(() => {});
    }
  }, [languagePreferences]);
  useEffect(() => {
    if (
      !userInfoDataLoading &&
      !userInfoDataError &&
      userInfoData &&
      userInfoData.getUserInfoData &&
      userInfoData.getUserInfoData.repoContributions.length === 0 &&
      !userDataLoading &&
      !userDataError &&
      userData?.getUserData &&
      userData?.getUserData.userName !== ''
    ) {
      (async () => {
        let isApiExceeded = false;
        const promises: Promise<any>[] = [];
        await getUser(
          userData?.getUserData?.userName,
          Number(readEnvironmentVariable('QUERY_GITHUB_API')),
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
                  (async (data) => {
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
                      await getTopContributors(data.fullName, userData.getUserData.token)
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
                  })(obj);
                })
              );
              return obj;
            });
            dispatch({
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
              dispatch({
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
      })().catch((err) => {
        console.log(err);
      });
    } else if (
      !userInfoDataLoading &&
      !userInfoDataError &&
      userInfoData &&
      userInfoData.getUserInfoData &&
      userInfoData.getUserInfoData.repoContributions.length > 0
    ) {
      dispatch({
        type: 'REPO_INFO_ADDED',
        payload: {
          repoInfo: userInfoData.getUserInfoData.repoInfo,
        },
      });
      dispatch({
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
  }, [userData, userDataLoading, userDataError, userInfoData, userInfoDataLoading, userInfoDataError]);
  const languagePreferencesRef = useRef<any[]>([]);

  useEffect(() => {
    languagePreferencesRef.current = languagePreferences;
  });

  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      setLanguagePreferences(
        [...languagePreferencesRef.current].map((obj) => {
          if (obj.language === event.target.name) {
            return {
              ...obj,
              language: event.target.name,
              checked: event.target.checked,
            };
          } else {
            return obj;
          }
        })
      );
    },
    [languagePreferencesRef.current]
  );

  const handleHeightChange = (readmeHeight: string) => {
    setHeight(readmeHeight);
  };
  const onClickRepoInfo = useCallback(
    (e: React.MouseEvent) => (fullName: string, branch: string, html: string) => {
      e.preventDefault();
      setFullName(fullName);
      setBranch(branch);
      setHtmlUrl(html);
      setActive(fullName);
    },
    []
  );
  const onClickLanguageStarInfo = (e: React.MouseEvent) => (language: string, clicked: boolean) => {
    e.preventDefault();
    if (clicked) {
      setLanguageFilter((prevState) => {
        const updated = [...prevState, language];
        return updated;
      });
    } else {
      setLanguageFilter((prevState) => {
        const updated = fastFilter((obj: any) => obj !== language, prevState);
        return updated;
      });
    }
  };
  const [checkedItems, setCheckedItems] = useState<any>({ descriptionTitle: true, readme: true });
  const handleCheckboxClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckedItems({ ...checkedItems, [event.target.name]: event.target.checked });
  };
  const [typedFilter, setTypedFilter] = useState('');
  const debounceInputChange = useCallback(
    _.debounce(function (typed) {
      setTypedFilter(typed);
    }, 500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    debounceInputChange(event.target.value);
  };
  const manageProfileRef = useRef<HTMLDivElement>(null);
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const handleResize = () => {
    if (document.location.pathname === '/profile') {
      setInnerWidth(window.innerWidth);
    }
  };
  const render = () => {
    const filter1 = fastFilter((obj: RepoInfoProps) => {
      if (languageFilter.length > 0 && languageFilter.includes(obj.language)) {
        return obj;
      } else if (languageFilter.length === 0) {
        return obj;
      }
    }, state.repoInfo);
    const filter2 = fastFilter((obj: any) => {
      if (
        (typedFilter.length > 0 &&
          checkedItems.descriptionTitle &&
          !!obj.description &&
          obj.description.includes(typedFilter)) ||
        (checkedItems.descriptionTitle && !!obj.fullName && obj.fullName.includes(typedFilter)) ||
        (checkedItems.descriptionTitle && !!obj.topics && obj.topics.includes(typedFilter)) ||
        (checkedItems.readme && !!obj.readme && obj.readme.includes(typedFilter))
      ) {
        return obj;
      } else if (typedFilter.length === 0) {
        return obj;
      }
    }, filter1);
    const filter3 = fastFilter((obj: any) => !!obj, filter2);
    return filter3;
  };
  useResizeHandler(manageProfileRef, handleResize);
  return (
    <div style={{ display: 'flex' }} ref={manageProfileRef}>
      <Drawer variant="permanent" className={classes.drawer} open={true}>
        <div className={classes.toolbar} />
        <List>
          <ListItem button key={'Languages Preference'} onClick={handleOpenLanguages}>
            <ListItemIcon>
              <SettingsIcon style={{ transform: 'scale(1.5)' }} />
            </ListItemIcon>
            <ListItemText primary={'Languages Preference'} className={classes.typography} />
          </ListItem>
          <Collapse in={openLanguages} timeout="auto" unmountOnExit>
            <div
              className="SelectMenu-list"
              style={{ background: 'var(--background-theme-color)', maxHeight: '300px' }}
            >
              <FormControl component="fieldset" className={classes.formControl}>
                <FormGroup>
                  {languagePreferences.map((obj: any, idx: number) => {
                    return (
                      <FormControlLabel
                        control={<Checkbox checked={obj.checked} onChange={handleCheckboxChange} name={obj.language} />}
                        label={obj.language}
                        key={idx}
                      />
                    );
                  })}
                </FormGroup>
              </FormControl>
            </div>
          </Collapse>
        </List>
        <Divider />
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
      </Drawer>
      <div style={{ display: 'flex' }}>
        <table>
          <thead>
            <tr>
              <th>
                <Search handleInputChange={handleInputChange} width={innerWidth} />
                <p>Search in:</p>
                <Checkboxes checkedItems={checkedItems} handleCheckboxClick={handleCheckboxClick} />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ position: 'absolute' }}>
                <div
                  style={{
                    width: `${innerWidth > 600 ? '350px' : `${innerWidth - 300}px`}`,
                    background: 'var(--background-theme-color)',
                    overflowY: 'auto',
                    height: height,
                    display: 'inline-block',
                  }}
                >
                  {render().map((obj: RepoInfoProps, idx) => {
                    return (
                      <RepoInfo
                        active={active}
                        obj={obj}
                        key={idx}
                        onClickRepoInfo={onClickRepoInfo}
                        contributions={state.contributors}
                        dispatch={dispatch}
                      />
                    );
                  })}
                </div>
              </td>
              <td style={{ paddingRight: '10px', paddingLeft: '10px' }}>
                <If condition={fullName !== '' && innerWidth > 850}>
                  <Then>
                    <Details
                      fullName={fullName}
                      width={innerWidth}
                      branch={branch}
                      html_url={htmlUrl}
                      handleHeightChange={handleHeightChange}
                    />
                  </Then>
                </If>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
});
ManageProfile.displayName = 'ManageProfile';
export default ManageProfile;
