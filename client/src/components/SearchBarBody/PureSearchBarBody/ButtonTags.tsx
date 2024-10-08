import React, { useEffect, useState } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { createTheme, MuiThemeProvider } from '@material-ui/core/styles';
import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { useTrackedState, useTrackedStateShared } from '../../../selectors/stateContextSelector';
import useCollapse from '../../../hooks/useCollapse';
import { TopicsProps } from '../../../typing/type';
import { Tags } from './Tags';

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

interface ButtonTagsProps {
  showTipsText: any;
  portalExpandable: any;
}

const ButtonTags: React.FC<ButtonTagsProps> = ({ showTipsText, portalExpandable }) => {
  const [state] = useTrackedState();
  const [stateShared] = useTrackedStateShared();
  const handleClickSearchTopicTags = (event: React.MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
  };
  const [renderTopicTags, setExpandableTopicTags] = useState(false);
  const { getToggleProps: toogleTopicTags, getCollapseProps: collapseTopicTags } = useCollapse({
    defaultExpanded: false, // is the images already expanded in the first place?
    onExpandStart() {
      setExpandableTopicTags(true);
    },
    onCollapseEnd() {
      setExpandableTopicTags(false);
    },
  });
  useEffect(() => {
    let isCancelled = false;
    if (!isCancelled) {
      setExpandableTopicTags(false);
    }
    return () => {
      isCancelled = true;
    };
  }, [stateShared.queryUsername]);

  const spawnTopicTags = () => {
    if (portalExpandable.current === null) {
      return null;
    } else {
      return createPortal(
        <div className={'tags'} {...collapseTopicTags()}>
          {state.topicTags.map((obj: TopicsProps, idx: number) => {
            if (renderTopicTags) {
              return <Tags key={idx} obj={obj} clicked={obj.clicked} />;
            }
            return <></>;
          })}
        </div>,
        portalExpandable.current
      );
    }
  };
  return (
    <React.Fragment>
      {renderTopicTags && spawnTopicTags()}
      <MuiThemeProvider theme={defaultTheme}>
        <MuiThemeProvider theme={theme}>
          <Tooltip title={showTipsText(state.mergedData.length > 0 ? 'filterTags' : 'noData')}>
            <div
              {...toogleTopicTags({
                onClick: handleClickSearchTopicTags,
                disabled: state.mergedData.length <= 0,
              })}
              className={clsx('btn', {
                'btn-success': renderTopicTags,
                'btn-default': !renderTopicTags,
              })}
              style={state.mergedData.length > 0 ? { cursor: 'pointer' } : { cursor: 'not-allowed' }}
            >
              <span className="glyphicon glyphicon-tags" />
            </div>
          </Tooltip>
        </MuiThemeProvider>
      </MuiThemeProvider>
    </React.Fragment>
  );
};
ButtonTags.displayName = 'ButtonTags';
export default ButtonTags;
