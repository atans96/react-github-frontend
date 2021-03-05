import { makeStyles } from '@material-ui/core';

export const useUserCardStyles = makeStyles({
  typography: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    fontSize: '15px',
  },
  typographySmall: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  wrapper: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridTemplateColumns: 'min-content auto',
    gridGap: 12,
    borderBottom: '3px solid #ff7da6',
    height: '50px',
    alignItems: 'center',
    width: '100%',
  },
  nameWrapper: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
});
