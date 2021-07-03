import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import { StateRateLimitProvider } from '../selectors/stateContextSelector';
import { loadable } from '../loadable';
import { createRenderElement } from '../Layout/MasonryLayout';

const ToolBar = () =>
  loadable({
    importFn: () =>
      import('./BottomNavigationBarBody/ToolBar').then((module) => createRenderElement(module.default, {})),
    cacheId: 'ToolBar',
    empty: () => <></>,
  });
const RepoStat = () =>
  loadable({
    importFn: () =>
      import('./BottomNavigationBarBody/RepoStat').then((module) => createRenderElement(module.default, {})),
    cacheId: 'RepoStat',
    empty: () => <></>,
  });

const RateLimit = () =>
  loadable({
    importFn: () =>
      import('./BottomNavigationBarBody/RateLimit').then((module) => createRenderElement(module.default, {})),
    cacheId: 'RateLimit',
    empty: () => <></>,
  });

const DrawerBar = () =>
  loadable({
    importFn: () =>
      import('./BottomNavigationBarBody/DrawerBar').then((module) => createRenderElement(module.default, {})),
    cacheId: 'DrawerBar',
    empty: () => <></>,
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
  return (
    <React.Fragment>
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        {ToolBar()}
        {RepoStat()}
        <StateRateLimitProvider>{RateLimit()}</StateRateLimitProvider>
      </AppBar>
      {DrawerBar()}
    </React.Fragment>
  );
};
BottomNavigationBar.displayName = 'BottomNavigationBar';
export default BottomNavigationBar;
