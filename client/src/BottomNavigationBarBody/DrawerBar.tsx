import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Drawer, IconButton, Theme } from '@material-ui/core';
import clsx from 'clsx';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { IState } from '../typing/interface';
import RSSFeed from './DrawerBarBody/RSSFeed';
import SubscribeFeed from './DrawerBarBody/SubscribeFeed';
import SubscribeFeedSetting from './DrawerBarBody/SubscribeFeedSetting';
import { useDraggable } from '../hooks/useDraggable';
import { DraggableCore } from 'react-draggable';

interface StyleProps {
  drawerWidth: string;
}

const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  drawer: {
    '& .MuiDrawer-paper': {
      width: (props) => props.drawerWidth,
      height: '100vh',
      overflowX: 'hidden',
      boxShadow: '3px 0 5px -2px #888',
      background: 'var(--background-theme-color)',
      zIndex: 1,
    },
    width: (props) => props.drawerWidth,
    flexShrink: 0,
    zIndex: 1,
  },
  drawerOpen: {
    width: (props) => props.drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: '10px',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
}));

interface DrawerBarProps {
  dispatch: any;
  state: IState;
  dispatchStargazersUser: any;
}

const DrawerBar: React.FC<DrawerBarProps> = ({ dispatch, state, dispatchStargazersUser }) => {
  const [open, setOpen] = useState(false);
  const [drawerWidth, dragHandlers, drawerRef] = useDraggable({});
  const classes = useStyles({ drawerWidth: open ? `${drawerWidth}px` : '0px' });

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    dispatch({
      type: 'SET_DRAWER_WIDTH',
      payload: {
        drawerWidth: open ? 200 : 0,
      },
    });
  }, [open]);

  useEffect(() => {
    return () => {
      dispatch({
        type: 'SET_DRAWER_WIDTH',
        payload: {
          drawerWidth: 0,
        },
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <React.Fragment>
      <div style={{ bottom: '-5px', left: '-10px', zIndex: 9999, position: 'fixed' }}>
        <button
          className={clsx('hamburger hamburger--vortex', {
            'is-active': open,
          })}
          type="button"
          onClick={handleClick}
        >
          <span className="hamburger-box">
            <span className="hamburger-inner" />
          </span>
        </button>
      </div>
      <Drawer
        ref={drawerRef}
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleClick}>{!open ? <ChevronRightIcon /> : <ChevronLeftIcon />}</IconButton>
        </div>
        <RSSFeed state={state} dispatch={dispatch} />
        <SubscribeFeed state={state} />
        <SubscribeFeedSetting state={state} dispatch={dispatch} dispatchStargazersUser={dispatchStargazersUser} />
      </Drawer>
      {open && (
        <DraggableCore key="drawerBar" {...dragHandlers}>
          <div style={{ height: '100vh', width: '0px' }}>
            <div className={'dragger'} style={{ top: '40%', left: `${drawerWidth}px` }}>
              <span />
            </div>
          </div>
        </DraggableCore>
      )}
    </React.Fragment>
  );
};
export default DrawerBar;
