import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import Pagination from '@material-ui/lab/Pagination';
import { Theme } from '@material-ui/core';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
import { SharedStore } from '../store/Shared/reducer';
import { DiscoverStore } from '../store/Discover/reducer';

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

const PaginationBarDiscover = React.memo(() => {
  const classes = useStyles();
  const { drawerWidth } = SharedStore.store().DrawerWidth();
  const { lastPageDiscover } = DiscoverStore.store().LastPageDiscover();
  const { pageDiscover } = DiscoverStore.store().PageDiscover();
  if (drawerWidth > 1200) {
    return (
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Toolbar>
          <If condition={lastPageDiscover > 0}>
            <Then>
              <div className={classes.paginationInfo}>
                <Pagination
                  className={classes.buttonPagination}
                  page={pageDiscover}
                  count={lastPageDiscover}
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
});
PaginationBarDiscover.displayName = 'PaginationBarDiscover';
export default PaginationBarDiscover;
