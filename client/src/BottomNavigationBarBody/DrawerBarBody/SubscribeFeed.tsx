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
import { isEqualObjects, uniqFast } from '../../util';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { subscribeUser } from '../../services';
import Parser from 'rss-parser';
import _ from 'lodash';
import { NavLink } from 'react-router-dom';
import useApolloFactory from '../../hooks/useApolloFactory';
import { IState } from '../../typing/interface';

const useStyles = makeStyles<Theme>(() => ({
  list: {
    paddingTop: '10px',
    paddingBottom: '80px',
  },
  paperUnseen: {
    marginBottom: '5px',
    padding: '1em',
    background: '#ffcece',
  },
  paper: {
    marginBottom: '5px',
    padding: '1em',
    background: 'var(--background-theme-color)',
  },
  typography: {
    '& .MuiTypography-root': {
      fontSize: '1.5rem',
    },
  },
}));

const rssParser = new Parser({
  customFields: {
    item: [
      'thumb',
      'image',
      ['content:encoded', 'fullContent'],
      ['media:content', 'mediaContent', { keepArray: true }],
    ] as Parser.CustomFieldItem<any>[],
  },
});
interface SubscribeFeedProps {
  state: IState;
}
const SubscribeFeed = React.memo<SubscribeFeedProps>(
  ({ state }) => {
    const { query, mutation } = useApolloFactory();
    const { watchUsersData, loadingWatchUsersData, errorWatchUsersData } = query.getWatchUsers;
    const classes = useStyles();
    const [openSubscription, setSubscription] = useState(false);
    const [xmlFileListAppend, setXmlFileListAppend] = useState<string[]>([]);
    const [showMore, setShowMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [notificationBadge, setNotificationBadge] = useState(0);
    const [displayUnseenFeeds, setUnseenFeeds] = useState<string[]>([]);
    const unseenFeeds = useRef<any[]>([]);
    const uniqqRef = useRef<any[]>([]);
    const promisesRef = useRef<Promise<void>[]>([]);
    const [seeMoreLength, setSeeMoreLength] = useState(0);
    const notification = useRef<any[]>([]);
    const previousDataLength = useRef<number>(0);
    const sortingData = useRef<string[]>([]);
    const timerRef = useRef<number | undefined>(undefined);
    const handleOpenSubscription = (e: React.MouseEvent) => {
      e.preventDefault();
      setSubscription(!openSubscription);
    };
    const handleOpenSubscriptionMore = (e: React.MouseEvent) => {
      e.preventDefault();
      setShowMore(!showMore);
    };
    const controller = new AbortController();
    const signal = controller.signal;
    const updater = (data: any, logins: any) => {
      let promises: Promise<void>[] = [];
      let HTML: any[] = [];
      let temp: Promise<void>;
      data.getWatchUsers.login.forEach((obj: any) => {
        if (logins.includes(obj.login)) {
          temp = subscribeUser(obj.login, signal)
            .then(async (res: any) => {
              const result = await rssParser.parseString(res.xmlFile);
              if (result.items) {
                const re = new RegExp('href="([^"]+)"', 'g');
                let matches;
                let output: any[] = [];
                try {
                  result.items.forEach((obj: any) => {
                    while ((matches = re.exec(obj.content))) {
                      const match = matches[0].match('href="(.*?)"')![1];
                      output.push(
                        Object.assign(
                          {},
                          {
                            index: matches.index,
                            value: 'href=https://github.com' + match,
                            len: matches[0].match('href="(.*?)"')![0].length,
                          }
                        )
                      );
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
                    //add obj.author to HTML.push to prevent a mix of feeds between two users when using Promise.all
                    //since the order of execution differ
                    HTML.push(
                      Object.assign(
                        {},
                        {
                          login: obj.author,
                          feeds: a,
                        }
                      )
                    );
                  });
                  if (!openSubscription) {
                    const feeds = uniqFast(HTML.filter((x: any) => x.login === obj.login).map((x: any) => x.feeds));
                    mutation
                      .watchUsersFeedsAdded({
                        variables: {
                          login: obj.login,
                          feeds: feeds,
                          lastSeenFeeds: [],
                        },
                      })
                      .then((res: any) => {
                        if (res.data.watchUsersFeedsAdded && res.data.watchUsersFeedsAdded.login.length > 0) {
                          notification.current.push(
                            Object.assign(
                              {},
                              {
                                login: obj.login,
                                notification: res.data.watchUsersFeedsAdded.login
                                  .find((x: any) => x.login === obj.login)
                                  .feeds.filter(
                                    (x: string) =>
                                      res.data.watchUsersFeedsAdded.login
                                        .find((x: any) => x.login === obj.login)
                                        .lastSeenFeeds.indexOf(x) === -1
                                  ).length,
                              }
                            )
                          );
                          unseenFeeds.current.push(
                            Object.assign(
                              {},
                              {
                                login: obj.login,
                                unseenFeeds: res.data.watchUsersFeedsAdded.login
                                  .find((x: any) => x.login === obj.login)
                                  .feeds.filter(
                                    (x: string) =>
                                      res.data.watchUsersFeedsAdded.login
                                        .find((x: any) => x.login === obj.login)
                                        .lastSeenFeeds.indexOf(x) === -1
                                  ),
                              }
                            )
                          );
                          unseenFeeds.current = _.uniqBy(unseenFeeds.current, 'login');
                          notification.current = _.uniqBy(notification.current, 'login');
                          notification.current = notification.current.filter((x) => logins.includes(x.login)); //handle for the user unsubscribe
                          const notificationLength = notification.current.reduce((acc, obj) => {
                            acc += obj.notification;
                            return acc;
                          }, 0);
                          setNotificationBadge(notificationLength); //show badge to the user when not openSubscription
                        }
                      })
                      .catch(() => {});
                  } else {
                    const unseenFeedss =
                      unseenFeeds.current
                        .filter((x) => x.login === obj.login)
                        .reduce((acc, obj) => {
                          acc.push(...obj.unseenFeeds);
                          return acc;
                        }, []) || [];
                    const feeds = uniqFast(HTML.filter((x: any) => x.login === obj.login).map((x: any) => x.feeds));
                    mutation
                      .watchUsersFeedsAdded({
                        variables: {
                          login: obj.login,
                          feeds: feeds,
                          lastSeenFeeds: [...feeds, ...unseenFeedss],
                        },
                      })
                      .then((res: any) => {
                        //we want to show both feeds and lastSeenFeeds together
                        const uniqq = uniqFast([
                          ...res.data.watchUsersFeedsAdded.login.find((x: any) => x.login === obj.login).feeds,
                          ...res.data.watchUsersFeedsAdded.login.find((x: any) => x.login === obj.login).lastSeenFeeds,
                        ]);
                        uniqqRef.current.push(
                          Object.assign(
                            {},
                            {
                              login: obj.login,
                              feeds: uniqq.reverse(),
                            }
                          )
                        );
                        uniqqRef.current = uniqqRef.current.filter((x) => logins.includes(x.login)); //handle for the user unsubscribe
                      })
                      .catch(() => {});
                  }
                } catch {}
              }
            })
            .catch((e) => {
              //if abort() is executed, bypass .then from promise and go directly to .catch
              console.log(e.message);
            });
        }
        if (temp !== null) {
          promises.push(temp);
        }
      });
      return promises;
    };
    const stop = () => {
      const timer = timerRef.current;
      if (timer) {
        // controller.abort();
        clearInterval(timer);
        timerRef.current = undefined;
      }
    };
    const exec = async (data: any, logins: any) => {
      //wrap Promise.all inside window.setInterval to make it cancellable when the user click subscribe again
      //while the previous request not finish
      promisesRef.current = updater(data, logins);
      if (logins.length > 0) {
        return Promise.allSettled(promisesRef.current).then((v) => {
          const isAllFulfilled = v.filter((obj) => obj.status === 'fulfilled').length;
          if (
            openSubscription &&
            uniqqRef.current.length > 0 &&
            uniqqRef.current.length >= previousDataLength.current &&
            isAllFulfilled === logins.length
          ) {
            //because Promise will return different order of user, we need to sort it based on original one (sortingData.current)
            let sorted: string[] = [];
            sortingData.current.forEach((sorting: string) => {
              //the order of uniqqRef need to be the reverse of what's in the database
              //in order to show the latest subscribed user at the the top of the stack
              uniqqRef.current.forEach((nonSorting) => {
                if (nonSorting.login === sorting) {
                  sorted.push(...nonSorting.feeds);
                }
              });
            });
            const uniqq = uniqFast(sorted);
            setSeeMoreLength(uniqq.length);
            setXmlFileListAppend(uniqq);
            setLoading(false);
            if (unseenFeeds.current.length > 0) {
              const temp = unseenFeeds.current.reduce((acc, obj) => {
                acc.push(...obj.unseenFeeds);
                return acc;
              }, []);
              setUnseenFeeds(temp);
            }
            uniqqRef.current = [];
            return { status: 200 };
          } else if (!openSubscription && notification.current.length > 0 && isAllFulfilled === logins.length) {
            notification.current = notification.current.filter((x) => logins.includes(x.login)); //handle for the user unsubscribe
            const notificationLength = notification.current.reduce((acc, obj) => {
              acc += obj.notification;
              return acc;
            }, 0);
            setNotificationBadge(notificationLength); //show badge to the user when not openSubscription
            return { status: 200 };
          } else {
            return { status: 400 };
          }
        });
      } else {
        setLoading(false);
        unseenFeeds.current = [];
        notification.current = [];
        setNotificationBadge(0);
        setXmlFileListAppend([]);
        setSeeMoreLength(0);
        return { status: 200 };
      }
    };
    const execWrapper = (data: any, logins: any) => {
      stop();
      exec(data, logins).then(({ status }: any) => {
        if (status === 200) {
          timerRef.current = window.setInterval(exec, 3 * 60 * 1000, data, logins);
        } else {
          execWrapper(data, logins);
        }
      });
    };
    useEffect(() => {
      if (
        !loadingWatchUsersData &&
        !errorWatchUsersData &&
        watchUsersData &&
        watchUsersData.getWatchUsers?.login?.length > 0
      ) {
        sortingData.current = watchUsersData.getWatchUsers.login.map((obj: any) => obj.login).reverse();
        if (openSubscription && notificationBadge > 0) {
          //don't setState outside of Promise.all.then unless it match the condition
          //otherwise Promise.all will re-rerender and causing weird effect
          setNotificationBadge(0); //get instant UI effect when expand the feeds without waiting watchUsersDatabase
          notification.current = [];
          uniqqRef.current = [];
        }
        if (openSubscription && previousDataLength.current < watchUsersData.getWatchUsers.login.length) {
          //if previousDataLength.current less than login.length, it indicates we receive new watchUsersData so we set loading, else no need
          setLoading(true); //only show loading when we haven't got watchUsersData from watchUsersDatabase
        } else if (!openSubscription) {
          unseenFeeds.current = [];
          setUnseenFeeds([]);
          notification.current = [];
          setNotificationBadge(0);
        }
        const logins = watchUsersData.getWatchUsers.login.reduce((acc: any, obj: any) => {
          acc.push(obj.login);
          return acc;
        }, []);
        execWrapper(watchUsersData, logins);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openSubscription]);

    useEffect(() => {
      if (
        !loadingWatchUsersData &&
        !errorWatchUsersData &&
        watchUsersData &&
        watchUsersData.getWatchUsers?.login?.length > 0
      ) {
        previousDataLength.current = watchUsersData.getWatchUsers.login.length;
        sortingData.current = watchUsersData.getWatchUsers.login.map((obj: any) => obj.login).reverse(); //element at the bottom is the latest one so we reverse the array
        setLoading(true);
        const logins = watchUsersData.getWatchUsers.login.reduce((acc: any, obj: any) => {
          acc.push(obj.login);
          return acc;
        }, []);
        unseenFeeds.current = unseenFeeds.current.filter((x) => logins.includes(x.login)); //handle for the user unsubscribe
        execWrapper(watchUsersData, logins);
      } else if (
        !loadingWatchUsersData &&
        !errorWatchUsersData &&
        watchUsersData &&
        watchUsersData.getWatchUsers?.login?.length === 0
      ) {
        //the case when there was 1 subscribed user and you unsubscribe that user, leaving login.length === 0
        unseenFeeds.current = [];
        notification.current = [];
        setNotificationBadge(0);
        setXmlFileListAppend([]);
        setSeeMoreLength(0);
        const logins = watchUsersData.getWatchUsers.login.reduce((acc: any, obj: any) => {
          acc.push(obj.login);
          return acc;
        }, []);
        execWrapper(watchUsersData, logins);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchUsersData, loadingWatchUsersData, errorWatchUsersData]);

    return (
      <List>
        <ListItem button key={'Subscription Feed'} onClick={handleOpenSubscription}>
          <ListItemIcon>
            <Badge badgeContent={notificationBadge} color="primary">
              <VisibilityIcon style={{ transform: 'scale(1.5)' }} />
            </Badge>
          </ListItemIcon>
          <ListItemText primary={'Subscription Feed'} className={classes.typography} />
          {openSubscription ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openSubscription} timeout="auto" unmountOnExit>
          <If condition={loading}>
            <Then>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </div>
            </Then>
          </If>
          <If condition={!loading && state.isLoggedIn}>
            <Then>
              <React.Fragment>
                {xmlFileListAppend.slice(0, 5).map((xml: string, index: number) => {
                  if (displayUnseenFeeds.includes(xml)) {
                    return (
                      <Paper className={classes.paperUnseen} key={index}>
                        <div dangerouslySetInnerHTML={{ __html: xml }} />
                      </Paper>
                    );
                  } else {
                    return (
                      <Paper className={classes.paper} key={index}>
                        <div dangerouslySetInnerHTML={{ __html: xml }} />
                      </Paper>
                    );
                  }
                })}
              </React.Fragment>
              <If condition={seeMoreLength > 5}>
                <Then>
                  <React.Fragment>
                    <Collapse in={showMore} timeout={0.1} unmountOnExit>
                      {xmlFileListAppend.slice(5).map((xml: string, index: number) => {
                        if (displayUnseenFeeds.includes(xml)) {
                          return (
                            <Paper className={classes.paperUnseen} key={index}>
                              <div dangerouslySetInnerHTML={{ __html: xml }} />
                            </Paper>
                          );
                        } else {
                          return (
                            <Paper className={classes.paper} key={index}>
                              <div dangerouslySetInnerHTML={{ __html: xml }} />
                            </Paper>
                          );
                        }
                      })}
                    </Collapse>
                    <If condition={!loading}>
                      <Then>
                        <ListItem button key={'1'} onClick={handleOpenSubscriptionMore}>
                          <ListItemText
                            primary={`${showMore ? 'Hide' : 'Show'} ${seeMoreLength - 5} ${!showMore ? 'More' : ''}`}
                          />
                          {showMore ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                      </Then>
                    </If>
                  </React.Fragment>
                </Then>
              </If>
              <If
                condition={
                  watchUsersData?.getWatchUsers?.login?.length === undefined ||
                  watchUsersData?.getWatchUsers?.login?.length === 0
                }
              >
                <Then>
                  <ListItem className={classes.queryContainer}>
                    <div style={{ textAlign: 'center' }}>
                      <ListItemText
                        primary={'No data yet. Please click stargazers to watch the user activities'}
                        className={classes.typographyQuery}
                      />
                    </div>
                  </ListItem>
                </Then>
              </If>
            </Then>
          </If>
          <If condition={!loading && !state.isLoggedIn}>
            <Then>
              <div style={{ textAlign: 'center' }}>
                <span>Please Login to access this feature</span>
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
        </Collapse>
      </List>
    );
  },
  (prevProps: any, nextProps: any) => {
    return isEqualObjects(prevProps.state.isLoggedIn, nextProps.state.isLoggedIn);
  }
);
export default SubscribeFeed;
