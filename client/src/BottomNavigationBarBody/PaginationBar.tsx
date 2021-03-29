import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';
import { isEqualObjects } from '../util';
import { IState } from '../typing/interface';
import RateLimit from './PaginationBarBody/RateLimit';
import ToolBar from './PaginationBarBody/ToolBar';
import { BottomNavigationBarProps } from '../HomeBody/BottomNavigationBar';
import RepoStat from './PaginationBarBody/RepoStat';

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

const PaginationBar: React.FC<
  Omit<BottomNavigationBarProps, 'dispatchStargazersUser' | 'dispatchShared' | 'stateShared'>
> = React.memo(
  ({ state, dispatch }) => {
    const classes = useStyles();
    return (
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <ToolBar state={state} />
        <RepoStat componentProps={{ state }} />
        <RateLimit componentProps={{ state, dispatch }} />
      </AppBar>
    );
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.state.page, nextProps.state.page) &&
      isEqualObjects(prevProps.state.lastPage, nextProps.state.lastPage) &&
      isEqualObjects(prevProps.state.mergedData.length, nextProps.state.mergedData.length) &&
      isEqualObjects(prevProps.state.searchUsers.length, nextProps.state.searchUsers.length) &&
      isEqualObjects(prevProps.state.rateLimit, nextProps.state.rateLimit) &&
      isEqualObjects(prevProps.state.rateLimitAnimationAdded, nextProps.state.rateLimitAnimationAdded) &&
      isEqualObjects(prevProps.state.repoStat, nextProps.state.repoStat)
    );
  }
);
PaginationBar.displayName = 'PaginationBar';
export default PaginationBar;
