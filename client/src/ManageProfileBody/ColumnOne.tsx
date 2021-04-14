import React from 'react';
import { Divider, Drawer, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import RowOne from './ColumnOneBody/RowOne';
import RowTwo from './ColumnOneBody/RowTwo';
import { createRenderElement } from '../Layout/MasonryLayout';
import { GraphQLUserData, GraphQLUserInfoData } from '../typing/interface';

interface ColumnOneProps {
  handleLanguageFilter: (args?: string) => void;
  userData: GraphQLUserData;
  userInfoData: GraphQLUserInfoData;
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
    marginTop: '10rem',
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
const ColumnOne: React.FC<ColumnOneProps> = React.memo(({ handleLanguageFilter }) => {
  const classes = useStyles({ drawerWidth: `250px` });
  return (
    <React.Fragment>
      <Drawer variant="permanent" className={classes.drawer} open={true}>
        <div className={classes.toolbar} />
        {createRenderElement(RowOne, {})}
        <Divider />
        {createRenderElement(RowTwo, { handleLanguageFilter })}
      </Drawer>
    </React.Fragment>
  );
});
ColumnOne.displayName = 'ColumnOne';
export default ColumnOne;
