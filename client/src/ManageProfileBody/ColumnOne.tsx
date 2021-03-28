import React, { useEffect, useRef } from 'react';
import { Divider, Drawer, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { IAction, IStateShared } from '../typing/interface';
import RowOne from './ColumnOneBody/RowOne';
import RowTwo from './ColumnOneBody/RowTwo';
import { useDraggable } from '../hooks/useDraggable';
import { DraggableCore } from 'react-draggable';
import { ActionManageProfile, ColumnWidthProps } from '../store/ManageProfile/reducer';
import { ActionShared } from '../store/Shared/reducer';

interface ColumnOneProps {
  handleLanguageFilter: (args?: string) => void;
  state: IStateShared;
  stateReducer: Map<string, ColumnWidthProps>;
  dispatchManageProfile: React.Dispatch<IAction<ActionManageProfile>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
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
  ({ handleLanguageFilter, state, dispatchManageProfile, dispatchShared, stateReducer }, ref) => {
    const displayName: string | undefined = (ColumnOne as React.ComponentType<any>).displayName;
    const drawerWidthRef = useRef(stateReducer?.get(displayName!)?.width);
    const [drawerWidth, dragHandlers, drawerRef] = useDraggable({
      drawerWidthClient: drawerWidthRef.current,
    });
    const classes = useStyles({ drawerWidth: `${drawerWidth}px` });
    useEffect(() => {
      if (stateReducer && document.location.pathname === '/profile') {
        const res = stateReducer.set(
          displayName!,
          Object.assign({}, { name: displayName!, width: drawerWidth, draggerPosition: drawerWidth })
        );
        dispatchManageProfile({ type: 'MODIFY', payload: { columnWidth: res } });
      }
    }, [drawerWidth]);

    return (
      <React.Fragment>
        <Drawer variant="permanent" className={classes.drawer} open={true} ref={drawerRef}>
          <div className={classes.toolbar} />
          <RowOne />
          <Divider />
          <RowTwo
            handleLanguageFilter={handleLanguageFilter}
            state={state}
            dispatchManageProfile={dispatchManageProfile}
            dispatchShared={dispatchShared}
          />
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
