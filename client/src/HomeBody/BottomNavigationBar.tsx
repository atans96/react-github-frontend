import React from 'react';
import DrawerBar from '../BottomNavigationBarBody/DrawerBar';
import { makeStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';
import ToolBar from '../BottomNavigationBarBody/PaginationBarBody/ToolBar';
import RepoStat from '../BottomNavigationBarBody/PaginationBarBody/RepoStat';
import RateLimit from '../BottomNavigationBarBody/PaginationBarBody/RateLimit';
import AppBar from '@material-ui/core/AppBar';
import { StateRateLimitProvider } from '../selectors/stateContextSelector';
const useStyles = makeStyles<Theme>((theme) => ({
  buttonPagination: {
    '& .MuiPaginationItem-root': {
      color: '#ffffff',
      fontSize: '13px',
    },
  },
  appBar: {
    zIndex: 2,
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
        <ToolBar />
        <RepoStat />
        <StateRateLimitProvider>
          <RateLimit />
        </StateRateLimitProvider>
      </AppBar>
      <DrawerBar />
    </React.Fragment>
  );
};
BottomNavigationBar.displayName = 'BottomNavigationBar';
export default BottomNavigationBar;
