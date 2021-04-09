import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Checkbox,
  CircularProgress,
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
import idx from 'idx';
import { useDeepMemo } from '../../hooks/useDeepMemo';
import CardDiscover from '../../DiscoverBody/CardDiscover';
import { Then } from '../../util/react-if/Then';
import { If } from '../../util/react-if/If';

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
const RowOne = React.memo(() => {
  const [openLanguages, setOpenLanguages] = useState(false);
  const classes = useStyles({ drawerWidth: '250px' });
  const handleOpenLanguages = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenLanguages(!openLanguages);
  };
  const location = useLocation();
  const displayName: string | undefined = (RowOne as React.ComponentType<any>).displayName;
  const { userData, userDataLoading, userDataError } = useApolloFactory(displayName!).query.getUserData();
  const languagesPreferenceAdded = useApolloFactory(displayName!).mutation.languagesPreferenceAdded;
  const [languagePreferences, setLanguagePreferences] = useState([] as any);
  useEffect(() => {
    let isFinished = false;
    if (
      idx(userData, (_) => !userDataLoading && !userDataError && _.getUserData.languagePreference.length > 0) &&
      location.pathname === '/profile' &&
      !isFinished
    ) {
      setLanguagePreferences(userData.getUserData.languagePreference);
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDataLoading, userDataError, userData]);

  useDeepCompareEffect(() => {
    let isFinished = false;
    if (location.pathname === '/profile' && !isFinished) {
      languagesPreferenceAdded({
        variables: {
          languagePreference: languagePreferences,
        },
      }).then(noop);
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languagePreferences]);

  const languagePreferencesRef = useRef<any[]>([]);

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/profile' && !isFinished) {
      languagePreferencesRef.current = languagePreferences;
      return () => {
        isFinished = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languagePreferences]);

  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      setLanguagePreferences(
        [...languagePreferencesRef.current].map((obj) => {
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languagePreferencesRef.current]
  );

  return (
    <List>
      <If condition={userDataLoading}>
        <Then>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p>
              Fetching user data<span className="one">.</span>
              <span className="two">.</span>
              <span className="three">.</span>
            </p>
          </div>
        </Then>
      </If>
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
              {useDeepMemo(() => {
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
});
RowOne.displayName = 'LanguagePreference';
export default RowOne;
