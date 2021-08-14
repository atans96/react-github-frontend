import React, { useRef, useState } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { createTheme, MuiThemeProvider } from '@material-ui/core/styles';
import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { useTrackedState, useTrackedStateShared } from '../../selectors/stateContextSelector';
import useCollapse from '../../hooks/useCollapse';
import { TopicsProps } from '../../typing/type';
import { Tags } from './Tags';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { ShouldRender } from '../../typing/enum';
import { parallel } from 'async';

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
  const [state, dispatch] = useTrackedState();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const handleClickSearchTopicTags = (event: React.MouseEvent): void => {
    event.preventDefault();
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
  const spawnTopicTags = () => {
    if (portalExpandable.current === null) {
      return null;
    } else {
      return createPortal(
        <div className={'tags'} {...collapseTopicTags()}>
          {state.topics.map((obj: TopicsProps, idx: number) => {
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
  const handleClickFilterSeenCards = (event: React.MouseEvent): void => {
    event.preventDefault();
    parallel([
      () => {
        if (!state.filterBySeen && renderTopicTags) {
          setExpandableTopicTags(false);
        }
      },
      () =>
        dispatch({
          type: 'FILTER_CARDS_BY_SEEN',
          payload: {
            filterBySeen: !state.filterBySeen,
          },
        }),
      () => {
        if (stateShared.shouldRender === ShouldRender.Home) {
          dispatchShared({
            type: 'SET_SHOULD_RENDER',
            payload: {
              shouldRender: '',
            },
          });
        } else {
          dispatchShared({
            type: 'SET_SHOULD_RENDER',
            payload: {
              shouldRender: ShouldRender.Home,
            },
          });
        }
      },
    ]);
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
                disabled: state.mergedData.length > 0 ? false : true,
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

      <MuiThemeProvider theme={defaultTheme}>
        <MuiThemeProvider theme={theme}>
          <If condition={stateShared.isLoggedIn}>
            <Then>
              <Tooltip title={showTipsText(`${state.filterBySeen ? 'noFilterSeen' : 'filterSeen'}`)}>
                <div onClick={handleClickFilterSeenCards} className="btn" style={{ cursor: 'pointer' }}>
                  <span className={`glyphicon ${state.filterBySeen ? 'glyphicon-eye-close' : 'glyphicon-eye-open'}`} />
                </div>
              </Tooltip>
            </Then>
          </If>
          <If condition={!stateShared.isLoggedIn}>
            <Then>
              <Tooltip title={showTipsText(`login`)}>
                <div className="btn" style={{ cursor: 'not-allowed', opacity: 0.6 }}>
                  <span className={`glyphicon ${state.filterBySeen ? 'glyphicon-eye-close' : 'glyphicon-eye-open'}`} />
                </div>
              </Tooltip>
            </Then>
          </If>
        </MuiThemeProvider>
      </MuiThemeProvider>
    </React.Fragment>
  );
};
ButtonTags.displayName = 'ButtonTags';
export default ButtonTags;
