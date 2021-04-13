import { useScrollTrigger, Zoom } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
interface ScrollTopProps {
  children: any;
}
const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    bottom: theme.spacing(8),
    right: theme.spacing(2),
  },
}));
export const ScrollTop: React.FC<ScrollTopProps> = React.forwardRef<React.Ref<HTMLDivElement>, ScrollTopProps>(
  ({ children }, ref) => {
    const classes = useStyles();
    const trigger = useScrollTrigger({
      disableHysteresis: true,
      threshold: 100,
    });

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault()
      const anchor = (event.currentTarget.ownerDocument || document).querySelector('.top');
      if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    return (
      <Zoom in={trigger}>
        <div onClick={handleClick} role="presentation" className={classes.root}>
          {children}
        </div>
      </Zoom>
    );
  }
);
