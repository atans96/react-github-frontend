import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import Pagination from '@material-ui/lab/Pagination';
import { Theme } from '@material-ui/core';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
import { isEqualObjects } from '../util';
import { IState } from '../typing/interface';

const useStyles = makeStyles<Theme>((theme) => ({
  buttonPagination: {
    '& .MuiPaginationItem-root': {
      color: '#ffffff',
      fontSize: '13px',
    },
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
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

interface PaginationBarProps {
  state: IState;
}

const PaginationBarDiscover: React.FC<PaginationBarProps> = React.memo(
  ({ state }) => {
    const classes = useStyles();
    return (
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Toolbar>
          <If condition={state.lastPageDiscover > 0}>
            <Then>
              <div className={classes.paginationInfo}>
                <Pagination
                  className={classes.buttonPagination}
                  page={state.pageDiscover}
                  count={state.lastPageDiscover}
                  color="secondary"
                />
              </div>
            </Then>
          </If>
          <div className={classes.grow} />
        </Toolbar>
      </AppBar>
    );
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.state.pageDiscover, nextProps.state.pageDiscover) &&
      isEqualObjects(prevProps.state.lastPageDiscover, nextProps.state.lastPageDiscover)
    );
  }
);
export default PaginationBarDiscover;
