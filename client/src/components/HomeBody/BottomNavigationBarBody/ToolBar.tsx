import React, { useEffect, useRef } from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import Pagination from '@material-ui/lab/Pagination';
import { Theme } from '@material-ui/core';
import { useTrackedState } from '../../../selectors/stateContextSelector';
import { useNotification } from '../../Home';

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
  const [state, dispatch] = useTrackedState();
  const [notification] = useNotification();
  const paginationRef = useRef<number>(1);
  function checkKey(e: any) {
    e = e || window.event;
    if (e.keyCode == '39' && notification.notification.length === 0) {
      paginationRef.current += 1;
      dispatch({
        type: 'ADVANCE_PAGE1',
        payload: {
          page: paginationRef.current,
        },
      });
    } else if (e.keyCode == '37' && paginationRef.current - 1 > 0) {
      paginationRef.current -= 1;
      dispatch({
        type: 'ADVANCE_PAGE1',
        payload: {
          page: paginationRef.current,
        },
      });
    }
  }
  useEffect(() => {
    document.addEventListener('keydown', checkKey);
    return () => {
      document.removeEventListener('keydown', checkKey);
    };
  }, []);
  return (
    <Toolbar>
      <div className={classes.paginationInfo}>
        <Pagination
          className={classes.buttonPagination}
          count={state.filterBySeen ? state.page + 1 : 1}
          page={state.page}
          color="secondary"
          onChange={(event: any, val: any) => {
            if (state.filterBySeen) {
              dispatch({
                type: 'ADVANCE_PAGE1',
                payload: {
                  page: val,
                },
              });
            }
          }}
        />
      </div>
      <div className={classes.grow} />
    </Toolbar>
  );
};
ToolBar.displayName = 'ToolBar';
export default ToolBar;
