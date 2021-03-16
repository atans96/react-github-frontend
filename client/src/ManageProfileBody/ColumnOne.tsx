import React from 'react';
import { Divider, Drawer, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { IState } from '../typing/interface';
import RowOne from './ColumnOneBody/RowOne';
import RowTwo from './ColumnOneBody/RowTwo';
import { DraggableCore } from 'react-draggable';

interface ColumnOneProps {
  handleLanguageFilter: (args?: string) => void;
  state: IState;
  dispatch: any;
  ref: React.Ref<HTMLDivElement>;
  drawerWidth: number;
  dragHandlers: any;
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
      zIndex: -1,
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
  ({ handleLanguageFilter, state, dispatch, drawerWidth, dragHandlers }, ref) => {
    const classes = useStyles({ drawerWidth: `${Math.min(drawerWidth, 600)}px` });
    return (
      <React.Fragment>
        <Drawer variant="permanent" className={classes.drawer} open={true} ref={ref}>
          <div className={classes.toolbar} />
          <RowOne state={state} />
          <Divider />
          <RowTwo handleLanguageFilter={handleLanguageFilter} state={state} dispatch={dispatch} />
        </Drawer>
        <DraggableCore key="handle" {...dragHandlers}>
          <div className={'dragger'} style={{ left: `${drawerWidth}px` }} />
        </DraggableCore>
      </React.Fragment>
    );
  }
);
ColumnOne.displayName = 'ColumnOne';
export default ColumnOne;
