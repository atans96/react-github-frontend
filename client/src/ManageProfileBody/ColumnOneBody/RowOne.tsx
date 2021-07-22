import React, { useEffect, useRef, useState } from 'react';
import {
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  FormGroup,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Theme,
} from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import { makeStyles } from '@material-ui/core/styles';
import { useApolloFactory } from '../../hooks/useApolloFactory';
import useDeepCompareEffect from '../../hooks/useDeepCompareEffect';
import { noop } from '../../util/util';
import { LanguagePreference } from '../../typing/type';
import { useLocation } from 'react-router-dom';
import { LocationGraphQL } from '../../typing/interface';
import { useStableCallback } from '../../util';

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
  content: {
    flexGrow: 1,
    padding: theme.spacing.length * 3,
  },
  grow: {
    flexGrow: 1,
  },
  typography: {
    '& .MuiTypography-root': {
      fontSize: '1.5rem',
    },
  },
  formControl: {
    margin: theme.spacing(3),
  },
}));
const RowOne = () => {
  const [openLanguages, setOpenLanguages] = useState(false);
  const classes = useStyles({ drawerWidth: '250px' });
  const handleOpenLanguages = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenLanguages(!openLanguages);
  };
  const location = useLocation<LocationGraphQL>();
  const displayName: string = (RowOne as React.ComponentType<any>).displayName || '';
  const languagesPreferenceAdded = useApolloFactory(displayName!).mutation.languagesPreferenceAdded;
  const [languagePreferences, setLanguagePreferences] = useState([] as any);
  useDeepCompareEffect(() => {
    let isFinished = false;
    if (
      location?.state?.data?.userData.getUserData.languagePreference.length > 0 &&
      location.pathname === '/profile' &&
      !isFinished
    ) {
      setLanguagePreferences(location.state.data.userData.getUserData.languagePreference);
    }
    return () => {
      isFinished = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.state?.data?.userData]);

  useDeepCompareEffect(() => {
    let isFinished = false;
    if (location.pathname === '/profile' && !isFinished) {
      languagesPreferenceAdded({
        getUserData: {
          languagePreference: languagePreferences,
        },
      }).then(noop);
    }
    return () => {
      isFinished = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languagePreferences]);

  const handleCheckboxChange = useStableCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setLanguagePreferences(
      [...languagePreferences].map((obj) => {
        if (obj.language === event.target.name) {
          return {
            ...obj,
            language: event.target.name,
            checked: event.target.checked,
          };
        } else {
          return obj;
        }
      })
    );
  });

  return (
    <List>
      <ListItem button key={'Languages Preference'} onClick={handleOpenLanguages}>
        <ListItemIcon>
          <SettingsIcon style={{ transform: 'scale(1.5)' }} />
        </ListItemIcon>
        <ListItemText primary={'Languages Preference'} className={classes.typography} />
      </ListItem>
      <Collapse in={openLanguages} timeout="auto" unmountOnExit>
        <div className="SelectMenu-list" style={{ background: 'var(--background-theme-color)', maxHeight: '300px' }}>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormGroup>
              {React.useMemo(() => {
                return languagePreferences.map((obj: LanguagePreference) => {
                  return (
                    <FormControlLabel
                      control={<Checkbox checked={obj.checked} onChange={handleCheckboxChange} name={obj.language} />}
                      label={obj.language}
                      key={obj.language}
                    />
                  );
                });
              }, [languagePreferences.length])}
            </FormGroup>
          </FormControl>
        </div>
      </Collapse>
    </List>
  );
};
RowOne.displayName = 'LanguagePreference';
export default RowOne;
