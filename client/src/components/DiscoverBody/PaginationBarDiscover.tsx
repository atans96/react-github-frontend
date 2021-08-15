import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import Pagination from '@material-ui/lab/Pagination';
import { Theme } from '@material-ui/core';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { useTrackedStateDiscover, useTrackedStateShared } from '../../selectors/stateContextSelector';

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

const PaginationBarDiscover = () => {
  const classes = useStyles();
  const [stateDiscover] = useTrackedStateDiscover();
  const [stateShared] = useTrackedStateShared();
  if (stateShared.drawerWidth > 1200) {
    return (
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Toolbar>
          <If condition={stateDiscover.lastPageDiscover > 0}>
            <Then>
              <div className={classes.paginationInfo}>
                <Pagination
                  className={classes.buttonPagination}
                  page={stateDiscover.pageDiscover}
                  count={stateDiscover.lastPageDiscover}
                  color="secondary"
                />
              </div>
            </Then>
          </If>
          <div className={classes.grow} />
        </Toolbar>
      </AppBar>
    );
  } else {
    return <></>;
  }
};
PaginationBarDiscover.displayName = 'PaginationBarDiscover';
export default React.memo(PaginationBarDiscover);
