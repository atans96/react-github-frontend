import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import Pagination from '@material-ui/lab/Pagination';
import { Theme } from '@material-ui/core';
import { IState } from '../../typing/interface';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { isEqualObjects } from '../../util';

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

interface ToolBarProps {
  state: IState;
}

const ToolBar: React.FC<ToolBarProps> = React.memo(
  ({ state }) => {
    const classes = useStyles();
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
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.state.page, nextProps.state.page) &&
      isEqualObjects(prevProps.state.lastPage, nextProps.state.lastPage)
    );
  }
);
ToolBar.displayName = 'ToolBar';
export default ToolBar;
