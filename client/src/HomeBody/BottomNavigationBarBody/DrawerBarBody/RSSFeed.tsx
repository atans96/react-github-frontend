import React, { useEffect, useRef, useState } from 'react';
import {
  Badge,
  CircularProgress,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Theme,
} from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { noop } from '../../../util/util';
import { Then } from '../../../util/react-if/Then';
import { If } from '../../../util/react-if/If';
import { fastFilter, uniqFast } from '../../../util';
import RssFeedIcon from '@material-ui/icons/RssFeed';
import { NavLink } from 'react-router-dom';
import { useTrackedStateShared } from '../../../selectors/stateContextSelector';
import { getRSSFeed } from '../../../services';
import { forEach } from 'async';
import { useRSSFeedMutation } from '../../../apolloFactory/useRSSFeedMutation';

const useStyles = makeStyles<Theme>(() => ({
  paper: {
    marginBottom: '5px',
    padding: '1em',
    background: 'var(--background-theme-color)',
  },
  paperUnseen: {
    marginBottom: '5px',
    padding: '1em',
    background: '#ffcece',
  },
  typography: {
    '& .MuiTypography-root': {
      fontSize: '1.5rem',
    },
  },
}));
const makeCancelable = (promise: Promise<any>) => {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then((val) => (hasCanceled_ ? reject({ isCanceled: true }) : resolve(val)));
    promise.catch((error) => (hasCanceled_ ? reject({ isCanceled: true }) : reject(error)));
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    },
  };
};
const re = new RegExp('href="([^"]+)"', 'g');

const RSSFeed = () => {
  const isMounted = useRef<boolean>(true);
  const [stateShared, dispatch] = useTrackedStateShared();
  const isTokenRSSExist = stateShared.tokenRSS.length > 0;
  const classes = useStyles();
  const displayName: string = (RSSFeed as React.ComponentType<any>).displayName || '';
  const rssFeedAdded = useRSSFeedMutation();
  const [showMoreRSS, setShowMoreRSS] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rssFeed, setRSSFeed] = useState<string[]>([]);
  const [token, setToken] = useState('');
  const [notification, setNotification] = useState('');
  const timerRef = useRef<number | undefined>(undefined);
  const unseenFeeds = useRef<string[]>([]);
  const previousPromise = useRef<any>(undefined);
  const [notificationBadge, setNotificationBadge] = useState(0);
  const [openRSS, setOpenRSS] = useState(false);

  const updater = async (tokenAdd: any, re: any) => {
    return new Promise((resolve, reject) => {
      getRSSFeed(tokenAdd)
        .then((res) => {
          let matches;
          const output: any[] = [];
          let HTML: string[] = [];
          const HTMLRender: Array<{ content: string; update: Date }> = [];
          try {
            forEach(
              res.items,
              (obj: any) => {
                const ja = JSON.parse(obj);
                while ((matches = re.exec(ja.content))) {
                  if (matches) {
                    const match = matches[0].match('href="(.*?)"')[1];
                    output.push(
                      Object.assign(
                        {},
                        {
                          index: matches.index,
                          value: 'href=https://github.com' + match,
                          len: matches[0].match('href="(.*?)"')[0].length,
                        }
                      )
                    );
                  } else {
                    break;
                  }
                }
                const a = ja.content.toString().replace(/./g, (c: any, i: any) => {
                  if (output.length > 0 && i === parseInt(output[0].index)) {
                    const returnOutput = output[0].value + ' ';
                    output.shift();
                    return returnOutput;
                  } else {
                    return c;
                  }
                });
                HTMLRender.push({ update: new Date(ja.updatedParsed), content: a });
              },
              (err) => {
                if (err) {
                  throw new Error('err');
                }
                HTMLRender.sortBy(function (o: any) {
                  return -o.update;
                });
                HTML = HTMLRender.map((obj) => obj.content);
                switch (isTokenRSSExist) {
                  case false:
                    if (isMounted.current) {
                      setLoading(false);
                      setToken('');
                      dispatch({
                        type: 'TOKEN_RSS_ADDED',
                        payload: {
                          tokenRSS: token,
                        },
                      });
                      localStorage.setItem('tokenRSS', token);
                      setRSSFeed(HTML);
                      rssFeedAdded({
                        getRSSFeed: {
                          rss: HTML,
                          lastSeen: HTML,
                        },
                      })
                        .then(noop)
                        .catch((e: any) => {
                          setLoading(false);
                          setNotification(e.message);
                          reject({ status: 400 });
                        });
                    }
                  case true:
                    switch (openRSS) {
                      case false:
                        if (isMounted.current) {
                          unseenFeeds.current = [];
                          rssFeedAdded({
                            getRSSFeed: {
                              rss: HTML,
                              lastSeen: [],
                            },
                          })
                            .then((res) => {
                              if (res.getRSSFeed.rss.length === 0 && res.getRSSFeed.lastSeen.length === 0) {
                                setRSSFeed(HTML);
                                resolve({ status: 200 });
                                return;
                              }
                              if (res.getRSSFeed.lastSeen) {
                                unseenFeeds.current = fastFilter(
                                  (x: string) => res.getRSSFeed.lastSeen.indexOf(x) === -1,
                                  res.getRSSFeed.rss
                                );
                                setNotificationBadge(unseenFeeds.current.length);
                                resolve({ status: 200 });
                              }
                            })
                            .catch((e: any) => {
                              setLoading(false);
                              setNotification(e.message);
                              reject({ status: 400 });
                            });
                        }
                      case true:
                        if (isMounted.current) {
                          const uniqq = uniqFast([...HTML, ...unseenFeeds.current]);
                          rssFeedAdded({
                            getRSSFeed: {
                              rss: HTML,
                              lastSeen: uniqq,
                            },
                          })
                            .then((res) => {
                              if (res.getRSSFeed.rss.length === 0 && res.getRSSFeed.lastSeen.length === 0) {
                                setRSSFeed(HTML);
                                resolve({ status: 200 });
                                return;
                              }
                              const uniqq = uniqFast([...res.getRSSFeed.lastSeen, ...res.getRSSFeed.rss]);
                              setRSSFeed(uniqq); //show it to the user
                              if (notificationBadge > 0) {
                                setNotificationBadge(0);
                              }
                              resolve({ status: 200 });
                            })
                            .catch((e: any) => {
                              setLoading(false);
                              setNotification(e.message);
                              reject({ status: 400 });
                            });
                        }
                    }
                }
              }
            );
          } catch (error) {
            if (isMounted.current) {
              console.log(error);
              setLoading(false);
              setNotification('Invalid RSS URL. Please try again!');
            }
            reject({ status: 400 });
          }
        })
        .catch((e) => {
          console.log(e.message);
          throw new Error(`Something wrong at ${displayName}`);
        });
    });
  };
  const stop = () => {
    const timer = timerRef.current;
    if (timer) {
      clearInterval(timer);
      timerRef.current = undefined;
    }
  };
  const handleOpenRSSShowMore = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMoreRSS(!showMoreRSS);
  };
  const updaterWrapper = (tokenAdd: string, re: any) => {
    stop();
    if (previousPromise.current !== undefined && timerRef.current) {
      previousPromise.current.cancel();
    }
    previousPromise.current = makeCancelable(updater(tokenAdd, re));
    previousPromise.current.promise.then(({ status }: any) => {
      if (status === 200) {
        timerRef.current = window.setInterval(updater, 3 * 60 * 1000, tokenAdd, re); //check update every 3 minute
      } else {
        updaterWrapper(tokenAdd, re);
      }
    });
  };
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isTokenRSSExist || token !== '') {
      const tokenAdd = isTokenRSSExist ? stateShared.tokenRSS : token;
      if (token !== '') {
        setLoading(true);
      }
      updaterWrapper(tokenAdd, re);
    }
  };

  useEffect(() => {
    if ((isTokenRSSExist || token !== '') && isMounted.current) {
      const tokenAdd = isTokenRSSExist ? stateShared.tokenRSS : token;
      if (token !== '') {
        setLoading(true);
      }
      if (!openRSS) {
        unseenFeeds.current = [];
      }
      updaterWrapper(tokenAdd, re);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateShared.tokenRSS, token, openRSS]);
  const handleOpenRSS = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenRSS(!openRSS);
    if (notificationBadge > 0) {
      setNotificationBadge(0);
    }
  };
  useEffect(() => {
    return () => {
      isMounted.current = false;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <List>
      <ListItem button key={'RSS Feed'} onClick={handleOpenRSS}>
        <ListItemIcon>
          <Badge badgeContent={notificationBadge} color="primary">
            <RssFeedIcon style={{ transform: 'scale(1.5)' }} />
          </Badge>
        </ListItemIcon>
        <ListItemText primary={'RSS Feed'} className={classes.typography} />
        {openRSS ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={openRSS} timeout="auto" unmountOnExit>
        <If condition={!isTokenRSSExist}>
          <Then>
            <If condition={loading}>
              <Then>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </div>
              </Then>
            </If>
            <If condition={!loading && stateShared.isLoggedIn}>
              <Then>
                <form
                  action="#"
                  method="get"
                  className="input-group"
                  style={{ padding: '1em' }}
                  onSubmit={(e) => {
                    if (isTokenRSSExist || token !== '') {
                      const tokenAdd = isTokenRSSExist ? stateShared.tokenRSS : token;
                      if (token !== '') {
                        setLoading(true);
                      }
                      updaterWrapper(tokenAdd, re);
                    }
                  }}
                >
                  <div style={{ display: 'flex' }}>
                    <input
                      autoCorrect="off"
                      autoComplete="off"
                      autoCapitalize="off"
                      required
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      type="text"
                      className="form-control"
                      placeholder={'Copy your RSS URL...'}
                    />
                  </div>
                </form>
                <div style={{ textAlign: 'center' }}>
                  <span>
                    {notification !== '' ? notification : `Please provide your Github RSS URL to access this feature`}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleClick}
                    style={{ marginBottom: '10px' }}
                  >
                    Submit URL
                  </button>
                </div>
              </Then>
            </If>
            <If condition={!loading && !stateShared.isLoggedIn}>
              <Then>
                <div style={{ textAlign: 'center' }}>
                  <span>{notification !== '' ? notification : `Please Login to access this feature`}</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button type="button" className="btn btn-primary" style={{ marginBottom: '10px' }}>
                    <NavLink style={{ color: 'white' }} to={{ pathname: '/login' }}>
                      Login
                    </NavLink>
                  </button>
                </div>
              </Then>
            </If>
          </Then>
        </If>
        <If condition={isTokenRSSExist}>
          <Then>
            <If condition={rssFeed.length === 0 && openRSS}>
              <Then>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </div>
              </Then>
            </If>
            <React.Fragment>
              {rssFeed.slice(0, 5).map((feed, idx) => {
                if (unseenFeeds.current.includes(feed)) {
                  return (
                    <Paper className={classes.paperUnseen} key={idx}>
                      <div dangerouslySetInnerHTML={{ __html: feed }} />
                    </Paper>
                  );
                } else {
                  return (
                    <Paper className={classes.paper} key={idx}>
                      <div dangerouslySetInnerHTML={{ __html: feed }} />
                    </Paper>
                  );
                }
              })}
            </React.Fragment>
            <If condition={rssFeed.length > 5}>
              <Then>
                <React.Fragment>
                  <Collapse in={showMoreRSS} timeout={0.1} unmountOnExit>
                    {rssFeed.slice(5).map((feed, idx) => {
                      if (unseenFeeds.current.includes(feed)) {
                        return (
                          <Paper className={classes.paperUnseen} key={idx}>
                            <div dangerouslySetInnerHTML={{ __html: feed }} />
                          </Paper>
                        );
                      } else {
                        return (
                          <Paper className={classes.paper} key={idx}>
                            <div dangerouslySetInnerHTML={{ __html: feed }} />
                          </Paper>
                        );
                      }
                    })}
                  </Collapse>
                  <ListItem button key={'1'} onClick={handleOpenRSSShowMore}>
                    <ListItemText
                      primary={`${showMoreRSS ? 'Hide' : 'Show'} ${rssFeed.length - 5} ${!showMoreRSS ? 'More' : ''}`}
                    />
                    {showMoreRSS ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                </React.Fragment>
              </Then>
            </If>
          </Then>
        </If>
      </Collapse>
    </List>
  );
};
RSSFeed.displayName = 'RSSFeed';
export default RSSFeed;
