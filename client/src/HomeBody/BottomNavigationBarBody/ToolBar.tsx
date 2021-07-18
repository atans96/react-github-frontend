import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import Pagination from '@material-ui/lab/Pagination';
import { Theme } from '@material-ui/core';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { HomeStore } from '../../store/Home/reducer';

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

const ToolBar = () => {
  const { lastPage } = HomeStore.store().LastPage();
  const { page } = HomeStore.store().Page();

  const classes = useStyles();
  return (
    <Toolbar>
      <If condition={lastPage > 0}>
        <Then>
          <div className={classes.paginationInfo}>
            <Pagination className={classes.buttonPagination} page={page} count={lastPage} color="secondary" />
          </div>
        </Then>
      </If>
      <div className={classes.grow} />
    </Toolbar>
  );
};
ToolBar.displayName = 'ToolBar';
export default ToolBar;
