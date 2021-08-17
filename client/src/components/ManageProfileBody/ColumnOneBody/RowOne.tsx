import React, { useEffect, useState } from 'react';
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
import { noop } from '../../../util/util';
import { LanguagePreference } from '../../../typing/type';
import { useLocation } from 'react-router-dom';
import { useStableCallback } from '../../../util';
import { useGetUserDataMutation } from '../../../apolloFactory/useGetUserDataMutation';
import { useTrackedStateShared } from '../../../selectors/stateContextSelector';
import { map } from 'async';

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
  const [state] = useTrackedStateShared();
  const location = useLocation();
  const [openLanguages, setOpenLanguages] = useState(false);
  const classes = useStyles({ drawerWidth: '250px' });
  const handleOpenLanguages = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenLanguages(!openLanguages);
  };
  const languagesPreferenceAdded = useGetUserDataMutation();
  const [languagePreferences, setLanguagePreferences] = useState([] as any);
  useEffect(() => {
    let isFinished = false;
    if (
      state?.userData?.languagePreference &&
      state?.userData?.languagePreference?.length > 0 &&
      location.pathname === '/profile' &&
      !isFinished
    ) {
      setLanguagePreferences(state.userData.languagePreference);
    }
    return () => {
      isFinished = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.userData.languagePreference]);

  const handleCheckboxChange = useStableCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    map(
      languagePreferences,
      (languagePreference: LanguagePreference, cb) => {
        if (languagePreference.language === event.target.name) {
          cb(null, {
            ...languagePreference,
            language: event.target.name,
            checked: event.target.checked,
          });
          return {
            ...languagePreference,
            language: event.target.name,
            checked: event.target.checked,
          };
        }
        cb(null, languagePreference);
        return languagePreference;
      },
      (err, res: any) => {
        if (err) {
          throw new Error('Err');
        }
        languagesPreferenceAdded({
          getUserData: {
            languagePreference: res,
          },
        }).then(noop);
        setLanguagePreferences(res);
      }
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
        <div
          className="SelectMenu-list"
          style={{
            background: 'var(--background-theme-color)',
            maxHeight: '300px',
            overflowX: 'hidden',
            overflowY: 'auto',
          }}
        >
          <FormControl component="fieldset" className={classes.formControl}>
            <FormGroup>
              {languagePreferences.map((obj: LanguagePreference) => {
                return (
                  <FormControlLabel
                    control={<Checkbox checked={obj.checked} onChange={handleCheckboxChange} name={obj.language} />}
                    label={obj.language}
                    key={obj.language}
                  />
                );
              })}
            </FormGroup>
          </FormControl>
        </div>
      </Collapse>
    </List>
  );
};
RowOne.displayName = 'LanguagePreference';
export default React.memo(RowOne);
