import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Drawer, IconButton, Theme } from '@material-ui/core';
import clsx from 'clsx';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { IState } from '../typing/interface';
import RSSFeed from './DrawerBarBody/RSSFeed';
import SubscribeFeed from './DrawerBarBody/SubscribeFeed';
import SubscribeFeedSetting from './DrawerBarBody/SubscribeFeedSetting';
import { DraggableCore } from 'react-draggable';
import $ from 'cash-dom';
import _ from 'lodash';

interface StyleProps {
  drawerWidth: string;
}
const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  drawer: {
    '& .MuiDrawer-paper': {
      zIndex: 1,
      width: (props) => props.drawerWidth,
      boxShadow: '3px 0 5px -2px #888',
      background: 'var(--background-theme-color)',
    },
    width: (props) => props.drawerWidth,
    flexShrink: 0,
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
  dragger: {
    height: '100vh',
    cursor: 'ew-resize',
    width: '10px',
    bottom: 0,
    top: 0,
    position: 'absolute',
    margin: '0px -5px',
    borderRadius: '2px',
    textAlign: 'center',
    zIndex: 99999,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
  },
}));

interface DrawerBarProps {
  dispatch: any;
  state: IState;
  dispatchStargazersUser: any;
}

const DrawerBar: React.FC<DrawerBarProps> = ({ dispatch, state, dispatchStargazersUser }) => {
  const [open, setOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(200);
  const direction = 'e';
  const drawerRef = useRef<HTMLDivElement>(null);
  const classes = useStyles({ drawerWidth: open ? `${Math.min(drawerWidth, 600)}px` : '0px' });
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(!open);
    dispatch({
      type: 'SET_DRAWER_WIDTH',
      payload: {
        drawerWidth: !open ? 200 : 0,
      },
    });
  };
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
  const handleDrag = (e: any, ui: any) => {
    const factor = direction === 'e' || direction === 's' ? -1 : 1;

    // modify the size based on the drag delta
    const delta = direction === 'e' || direction === 'w' ? ui.deltaX : ui.deltaY;
    setDrawerWidth(Math.max(200, drawerWidth - delta * factor));
  };

  const handleDragEnd = () => {
    validateSize();
  };
  const dragHandlers = {
    onDrag: handleDrag,
    onStop: _.debounce(handleDragEnd, 100),
  };
  const validateSize = () => {
    // Or if our size doesn't equal the actual content size, then we
    // must have pushed past the min size of the content, so resize back
    //let minSize = isHorizontal ? $(actualContent).outerWidth(true) : $(actualContent).outerHeight(true);
    if (drawerRef.current) {
      let minSize =
        direction === 'e' || direction === 'w' ? drawerRef.current.scrollWidth : drawerRef.current.scrollHeight;

      const margins =
        direction === 'e' || direction === 'w'
          ? $(drawerRef.current).outerWidth(true) - $(drawerRef.current).outerWidth()
          : $(drawerRef.current).outerHeight(true) - $(drawerRef.current).outerHeight();
      minSize += margins;

      if (drawerWidth !== minSize) {
        setDrawerWidth(minSize);
      }
    }
  };
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
        variant="permanent"
        ref={drawerRef}
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleClick}>{!open ? <ChevronRightIcon /> : <ChevronLeftIcon />}</IconButton>
        </div>
        <RSSFeed state={state} dispatch={dispatch} />
        <SubscribeFeed state={state} />
        <SubscribeFeedSetting state={state} dispatch={dispatch} dispatchStargazersUser={dispatchStargazersUser} />
      </Drawer>
      <DraggableCore key="handle" {...dragHandlers}>
        <div className={classes.dragger} style={{ left: `${drawerWidth}px` }} />
      </DraggableCore>
    </React.Fragment>
  );
};
export default DrawerBar;
