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
import { addRSSFeed, noop } from '../../../util/util';
import { Then } from '../../../util/react-if/Then';
import { If } from '../../../util/react-if/If';
import { fastFilter, uniqFast } from '../../../util';
import RssFeedIcon from '@material-ui/icons/RssFeed';
import { NavLink, useLocation } from 'react-router-dom';
import { useApolloFactory } from '../../../hooks/useApolloFactory';
import { useTrackedStateShared } from '../../../selectors/stateContextSelector';
import idx from 'idx';

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

const RSSFeed = () => {
  const [stateShared, dispatch] = useTrackedStateShared();
  const isTokenRSSExist = idx(stateShared, (_) => _.tokenRSS.length > 0) ?? false;
  const classes = useStyles();
  const displayName: string | undefined = (RSSFeed as React.ComponentType<any>).displayName;
  const tokenRSSAdded = useApolloFactory(displayName!).mutation.tokenRSSAdded;
  const rssFeedAdded = useApolloFactory(displayName!).mutation.rssFeedAdded;
  const [openRSS, setOpenRSS] = useState(false);
  const [showMoreRSS, setShowMoreRSS] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rssFeed, setRSSFeed] = useState<string[]>([]);
  const [token, setToken] = useState('');
  const [notification, setNotification] = useState('');
  const timerRef = useRef<number | undefined>(undefined);
  const unseenFeeds = useRef<string[]>([]);
  const re = new RegExp('href="([^"]+)"', 'g');
  const previousPromise = useRef<any>(undefined);
  const [notificationBadge, setNotificationBadge] = useState(0);
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
  const updater = async (tokenAdd: any, re: any) => {
    return new Promise(async (resolve, reject) => {
      await addRSSFeed(tokenAdd)
        .then((res: any) => {
          let matches;
          const output: any[] = [];
          const HTML: string[] = [];
          try {
            res.items.forEach((obj: any) => {
              while ((matches = re.exec(obj.content))) {
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
              const a = obj.content.toString().replace(/./g, (c: any, i: any) => {
                if (output.length > 0 && i === parseInt(output[0].index)) {
                  const returnOutput = output[0].value + ' ';
                  output.shift();
                  return returnOutput;
                } else {
                  return c;
                }
              });
              HTML.push(a);
            });
            if (!isTokenRSSExist) {
              setLoading(false);
              setToken('');
              tokenRSSAdded({
                variables: {
                  tokenRSS: token,
                },
              }).then(noop);
              dispatch({
                type: 'TOKEN_RSS_ADDED',
                payload: {
                  tokenRSS: token,
                },
              });
              setRSSFeed(HTML.reverse());
              rssFeedAdded({
                variables: {
                  rss: HTML,
                  rssLastSeen: HTML,
                },
              }).then(noop);
            }
            if (!openRSS) {
              unseenFeeds.current = [];
              rssFeedAdded({
                variables: {
                  rss: HTML,
                  rssLastSeen: [],
                },
              })
                .then((res: any) => {
                  if (res.data.rssFeedAdded) {
                    unseenFeeds.current = fastFilter(
                      (x: string) => res.data.rssFeedAdded.rssLastSeen.indexOf(x) === -1,
                      res.data.rssFeedAdded.rss
                    );
                    setNotificationBadge(unseenFeeds.current.length);
                    resolve({ status: 200 });
                  }
                })
                .catch((e: any) => {
                  setLoading(false);
                  setNotification(e.message);
                  resolve({ status: 400 });
                });
            } else {
              if (isTokenRSSExist) {
                const uniqq = uniqFast([...HTML, ...unseenFeeds.current]);
                rssFeedAdded({
                  variables: {
                    rss: HTML,
                    rssLastSeen: uniqq,
                  },
                })
                  .then((res: any) => {
                    const uniqq = uniqFast([...res.data.rssFeedAdded.rssLastSeen, ...res.data.rssFeedAdded.rss]);
                    setRSSFeed(uniqq.reverse()); //show it to the user
                    if (notificationBadge > 0) {
                      setNotificationBadge(0);
                    }
                    resolve({ status: 200 });
                  })
                  .catch((e: any) => {
                    setLoading(false);
                    setNotification(e.message);
                    resolve({ status: 400 });
                  });
              }
            }
          } catch (error) {
            console.log(error);
            setLoading(false);
            setNotification('Invalid RSS URL. Please try again!');
            resolve({ status: 400 });
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
  const handleOpenRSS = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenRSS(!openRSS);
    if (notificationBadge > 0) {
      setNotificationBadge(0);
    }
  };
  const handleOpenRSSShowMore = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMoreRSS(!showMoreRSS);
  };
  const updaterWrapper = (tokenAdd: string, re: any) => {
    stop();
    if (previousPromise.current !== undefined) {
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

  const location = useLocation();
  useEffect(() => {
    let isFinished = false;
    if ((isTokenRSSExist || token !== '') && location.pathname === '/' && !isFinished) {
      const tokenAdd = isTokenRSSExist ? stateShared.tokenRSS : token;
      if (token !== '') {
        setLoading(true);
      }
      if (!openRSS) {
        unseenFeeds.current = [];
      }
      updaterWrapper(tokenAdd, re);
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateShared.tokenRSS, token, openRSS]);

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
                <form action="#" method="get" className="input-group" style={{ padding: '1em' }}>
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
