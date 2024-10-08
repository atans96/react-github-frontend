import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Drawer, IconButton, Theme } from '@material-ui/core';
import clsx from 'clsx';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { useDraggable } from '../../../hooks/useDraggable';
import { DraggableCore } from 'react-draggable';
import { useTrackedStateShared } from '../../../selectors/stateContextSelector';
import { useStableCallback } from '../../../util';
import Loadable from 'react-loadable';
import Empty from '../../Layout/EmptyLayout';
import { useClickOutside } from '../../../hooks/hooks';
const RSSFeed = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "RSSFeed" */ './DrawerBarBody/RSSFeed'),
});

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
      zIndex: 10,
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

const DrawerBar = () => {
  const [open, setOpen] = useState(false);
  const [drawerWidth, dragHandlers, drawerRef] = useDraggable({});
  const classes = useStyles({ drawerWidth: open ? `${drawerWidth}px` : '0px' });
  const [, dispatch] = useTrackedStateShared();
  const handleClick = useStableCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((prev) => !prev);
  });
  const isFinished = useRef(false);

  useEffect(() => {
    return () => {
      isFinished.current = true;
      dispatch({
        type: 'SET_DRAWER_WIDTH',
        payload: {
          drawerWidth: 0,
        },
      });
    };
  }, []);

  useEffect(() => {
    if (!isFinished.current) {
      dispatch({
        type: 'SET_DRAWER_WIDTH',
        payload: {
          drawerWidth: open ? 200 : 0,
        },
      });
    }
  }, [open]);
  useClickOutside(drawerRef, () => setOpen(false), ['hamburger', 'hamburger-parent']);
  return (
    <React.Fragment>
      <div style={{ bottom: '-5px', left: '-10px', zIndex: 9999, position: 'fixed' }} className={'hamburger-parent'}>
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
        {open && (
          <>
            <RSSFeed />
            <DraggableCore key="drawerBar" {...dragHandlers}>
              <div style={{ height: '100vh', width: '0px', position: 'fixed' }}>
                <div className={'dragger'} style={{ top: '40%', left: `${drawerWidth}px` }}>
                  <span />
                </div>
              </div>
            </DraggableCore>
          </>
        )}
      </Drawer>
      {open && <div className={'backdrop'} />}
    </React.Fragment>
  );
};
DrawerBar.displayName = 'DrawerBar';
export default React.memo(DrawerBar);
