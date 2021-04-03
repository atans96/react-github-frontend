import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import Pagination from '@material-ui/lab/Pagination';
import { Theme } from '@material-ui/core';
import { If } from '../../../util/react-if/If';
import { Then } from '../../../util/react-if/Then';
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
    left: '50%',
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
      <If condition={state.lastPage > 0}>
        <Then>
          <div className={classes.paginationInfo}>
            <Pagination
              className={classes.buttonPagination}
              page={state.page}
              count={state.lastPage}
              color="secondary"
            />
          </div>
        </Then>
      </If>
      <div className={classes.grow} />
    </Toolbar>
  );
};
ToolBar.displayName = 'ToolBar';
export default ToolBar;
