import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

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
