import React, { useEffect } from 'react';
import { Divider, Drawer, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { IState } from '../typing/interface';
import RowOne from './ColumnOneBody/RowOne';
import RowTwo from './ColumnOneBody/RowTwo';
import { useDraggable } from '../hooks/useDraggable';
import { DraggableCore } from 'react-draggable';
import { SinglyLinkedList } from '../util/util';
import { ColumnWidthProps } from '../ManageProfile';

interface ColumnOneProps {
  handleLanguageFilter: (args?: string) => void;
  state: IState;
  dispatch: any;
  stateReducer: SinglyLinkedList<ColumnWidthProps>;
  dispatchReducer: any;
}

interface StyleProps {
  drawerWidth: string;
}

const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  root: {
    display: 'flex',
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: (props) => props.drawerWidth,
    flexShrink: 0,
    zIndex: 1,
    whiteSpace: 'nowrap',
    '& .MuiDrawer-paper': {
      width: (props) => props.drawerWidth,
      overflowX: 'hidden',
      boxShadow: '3px 0 5px -2px #888',
      background: 'var(--background-theme-color)',
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '74px',
    marginTop: theme.spacing.length,
    justifyContent: 'flex-end',
    padding: '0 8px',
  },
}));
const ColumnOne: React.FC<ColumnOneProps> = React.forwardRef(
  ({ handleLanguageFilter, state, dispatch, stateReducer, dispatchReducer }, ref) => {
    const [drawerWidth, dragHandlers, drawerRef] = useDraggable({
      drawerWidthClient: stateReducer.findNodeIndex((data: ColumnWidthProps) => data.name === 1)?.node?.data.width,
    });
    const classes = useStyles({ drawerWidth: `${drawerWidth}px` });
    useEffect(() => {
      dispatchReducer({ type: 1, width: drawerWidth });
    }, [drawerWidth]);
    return (
      <React.Fragment>
        <Drawer variant="permanent" className={classes.drawer} open={true} ref={drawerRef}>
          <div className={classes.toolbar} />
          <RowOne state={state} />
          <Divider />
          <RowTwo handleLanguageFilter={handleLanguageFilter} state={state} dispatch={dispatch} />
        </Drawer>
        <DraggableCore key="columnOne" {...dragHandlers}>
          <div style={{ height: '100vh', width: '0px' }}>
            <div className={'dragger'} style={{ left: `${drawerWidth}px`, top: '40%' }}>
              <span />
            </div>
          </div>
        </DraggableCore>
      </React.Fragment>
    );
  }
);
ColumnOne.displayName = 'ColumnOne';
export default ColumnOne;
