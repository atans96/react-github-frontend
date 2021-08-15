import React from 'react';
import InputSlider from '../../../../Layout/SliderLayout';
import { CheckIcon, PeopleIcon, ReposIcon } from '../../../../../util/icons';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import { useTrackedStateStargazers } from '../../../../../selectors/stateContextSelector';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
}));

export interface FilterResultSettings {
  props: any;
}

const FilterResultSettings: React.FC<FilterResultSettings> = ({ props }) => {
  const classes = useStyles();
  const [state, dispatch] = useTrackedStateStargazers();
  const dispatchStargazersUsers = (stargazersUsers: number) => {
    dispatch({
      type: 'STARGAZERS_USERS',
      payload: {
        stargazersUsers: stargazersUsers,
      },
    });
  };
  const dispatchStargazersUsersRepo = (stargazersUsersStarredRepositories: number) => {
    dispatch({
      type: 'STARGAZERS_USERS_REPOS',
      payload: {
        stargazersUsersStarredRepositories: stargazersUsersStarredRepositories,
      },
    });
  };
  return (
    <div style={{ borderBottom: '1px solid #eaecef' }}>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        <details id={'users'} className="details-reset" style={{ padding: '1em', textAlign: 'center' }}>
          <summary className="btn">
            Users <span className="dropdown-caret" />
          </summary>
          <InputSlider
            type={'users'}
            inputWidth={30}
            sliderWidth={150}
            defaultValue={state.stargazersUsers}
            dispatch={dispatchStargazersUsers}
            icon={<PeopleIcon />}
          />
        </details>
        <details id={'repos'} className="details-reset" style={{ padding: '1em', textAlign: 'center' }}>
          <summary className="btn">
            Starred Repos <span className="dropdown-caret" />
          </summary>
          <InputSlider
            type={'repos'}
            inputWidth={30}
            sliderWidth={150}
            defaultValue={state.stargazersUsersStarredRepositories}
            dispatch={dispatchStargazersUsersRepo}
            icon={<ReposIcon />}
          />
        </details>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          {...props}
          variant="contained"
          color="default"
          size="small"
          className={classes.button}
          startIcon={<CheckIcon />}
        >
          Apply Filter Settings
        </Button>
      </div>
    </div>
  );
};
FilterResultSettings.displayName = 'FilterResultSettings';
export default React.memo(FilterResultSettings);
