import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import { StateRateLimitProvider, useTrackedStateShared } from '../selectors/stateContextSelector';
import Loadable from 'react-loadable';
import '../hamburgers.css';
import Empty from '../Layout/EmptyLayout';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
const ToolBar = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "ToolBar" */ './BottomNavigationBarBody/ToolBar'),
});

const RateLimit = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "RateLimit" */ './BottomNavigationBarBody/RateLimit'),
});

const DrawerBar = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "DrawerBar" */ './BottomNavigationBarBody/DrawerBar'),
});
const useStyles = makeStyles<Theme>((theme) => ({
  buttonPagination: {
    '& .MuiPaginationItem-root': {
      color: '#ffffff',
      fontSize: '13px',
    },
  },
  appBar: {
    zIndex: 20,
    top: 'auto',
    bottom: 0,
    height: '50px',
    backgroundColor: '#000000',
  },
  grow: {
    flexGrow: 1,
  },
  paginationInfo: {
    position: 'fixed',
    left: '50%',
    bottom: '-10px',
    transform: 'translate(-50%, -50%)',
    margin: '0 auto',
  },
}));
const BottomNavigationBar = () => {
  const classes = useStyles();
  const [stateShared] = useTrackedStateShared();
  return (
    <React.Fragment>
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <ToolBar />
        <If condition={stateShared.width > 900}>
          <Then>
            <StateRateLimitProvider>
              <RateLimit />
            </StateRateLimitProvider>
          </Then>
        </If>
      </AppBar>
      <If condition={stateShared.width > 750}>
        <Then>
          <DrawerBar />
        </Then>
      </If>
    </React.Fragment>
  );
};
BottomNavigationBar.displayName = 'BottomNavigationBar';
export default BottomNavigationBar;
