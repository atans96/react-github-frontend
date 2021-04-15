import React, { useState } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import clsx from 'clsx';
import { createPortal } from 'react-dom';
import InputSlider from '../../Layout/SliderLayout';
import { useTrackedStateShared } from '../../selectors/stateContextSelector';

const defaultTheme = createMuiTheme();
const theme = createMuiTheme({
  overrides: {
    MuiTooltip: {
      tooltip: {
        fontSize: '16px',
      },
    },
  },
});

interface ButtonPageSettingProps {
  showTipsText: any;
  portal: any;
}

const ButtonPageSetting: React.FC<ButtonPageSettingProps> = ({ showTipsText, portal }) => {
  const [renderSlider, setExpandableSlider] = useState(false);
  const handleClickSlider = (event: React.MouseEvent): void => {
    event.preventDefault();
    setExpandableSlider(!renderSlider);
  };
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const dispatchPerPage = (perPage: string) => {
    dispatchShared({
      type: 'PER_PAGE',
      payload: {
        perPage: perPage,
      },
    });
  };
  const spawnSlider = (portal: React.RefObject<Element>) => {
    if (portal.current === null) {
      return null;
    } else {
      return createPortal(
        <div style={{ position: 'absolute' }}>
          <InputSlider
            type={'perPage'}
            inputWidth={40}
            sliderWidth={480}
            defaultValue={stateShared.perPage}
            dispatch={dispatchPerPage}
            maxSliderRange={1000}
          />
        </div>,
        portal.current
      );
    }
  };

  return (
    <React.Fragment>
      {renderSlider && spawnSlider(portal)}
      <MuiThemeProvider theme={defaultTheme}>
        <MuiThemeProvider theme={theme}>
          <Tooltip title={showTipsText('perPageSetting')}>
            <div
              onClick={handleClickSlider}
              className={clsx('btn', {
                'btn-success': renderSlider,
                'btn-default': !renderSlider,
              })}
              style={{ cursor: 'pointer' }}
            >
              <span className="glyphicon glyphicon-duplicate" />
            </div>
          </Tooltip>
        </MuiThemeProvider>
      </MuiThemeProvider>
    </React.Fragment>
  );
};
ButtonPageSetting.displayName = 'ButtonPageSetting';
export default ButtonPageSetting;
