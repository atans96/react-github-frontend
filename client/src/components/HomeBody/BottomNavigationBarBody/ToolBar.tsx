import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import Pagination from '@material-ui/lab/Pagination';
import { Theme } from '@material-ui/core';
import { useTrackedState } from '../../../selectors/stateContextSelector';

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
    left: '45vw',
    bottom: '-10px',
    transform: 'translate(-50%, -50%)',
    margin: '0 auto',
  },
}));

const ToolBar = () => {
  const classes = useStyles();
  const [state] = useTrackedState();
  return (
    <Toolbar>
      <div className={classes.paginationInfo}>
        <Pagination
          className={classes.buttonPagination}
          page={state.page}
          count={state.lastPage > 1 ? state.lastPage : state.page}
          color="secondary"
        />
      </div>
      <div className={classes.grow} />
    </Toolbar>
  );
};
ToolBar.displayName = 'ToolBar';
export default ToolBar;
