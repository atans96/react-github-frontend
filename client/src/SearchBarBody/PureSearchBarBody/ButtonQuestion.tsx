import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { createTheme, MuiThemeProvider } from '@material-ui/core/styles';

const defaultTheme = createTheme();
const theme = createTheme({
  overrides: {
    MuiTooltip: {
      tooltip: {
        fontSize: '16px',
      },
    },
  },
});

interface ButtonQuestionrProps {
  showTipsText: any;
}

const ButtonQuestion: React.FC<ButtonQuestionrProps> = ({ showTipsText }) => {
  return (
    <MuiThemeProvider theme={defaultTheme}>
      <MuiThemeProvider theme={theme}>
        <Tooltip title={showTipsText('search')}>
          <div className="btn btn-default" style={{ cursor: 'default' }}>
            <span className="glyphicon glyphicon-question-sign" />
          </div>
        </Tooltip>
      </MuiThemeProvider>
    </MuiThemeProvider>
  );
};
ButtonQuestion.displayName = 'ButtonQuestion';
export default ButtonQuestion;
