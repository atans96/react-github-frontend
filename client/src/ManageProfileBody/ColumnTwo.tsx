import React, { useCallback, useEffect, useRef, useState } from 'react';
import Search from './ColumnTwoBody/Search';
import Checkboxes from './ColumnTwoBody/Checkboxes';
import { RepoInfoProps } from '../typing/type';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
import _ from 'lodash';
import { fastFilter } from '../util';
import { IState } from '../typing/interface';
import Details from './ColumnTwoBody/Details';
import RepoInfo from './ColumnTwoBody/RepoInfo';
import { useDraggable } from '../hooks/useDraggable';
import { DraggableCore } from 'react-draggable';
import { ColumnWidthProps } from '../ManageProfile';

interface ColumnTwoProps {
  languageFilter: string[];
  state: IState;
  dispatch: any;
  stateReducer: Map<string, ColumnWidthProps>;
  dispatchReducer: any;
}

const ColumnTwo: React.FC<ColumnTwoProps> = ({ state, languageFilter, dispatch, stateReducer, dispatchReducer }) => {
  const [checkedItems, setCheckedItems] = useState<any>({ descriptionTitle: true, readme: true });
  const displayName: string | undefined = (ColumnTwo as React.ComponentType<any>).displayName;
  const [typedFilter, setTypedFilter] = useState('');
  const [active, setActive] = useState('');
  const [height, setHeight] = useState('100vh');
  const [fullName, setFullName] = useState('');
  const [branch, setBranch] = useState('');
  const [htmlUrl, setHtmlUrl] = useState('');
  const handleHeightChange = (readmeHeight: string) => {
    setHeight(readmeHeight);
  };
  const onClickRepoInfo = useCallback(
    (e: React.MouseEvent) => (fullName: string, branch: string, html: string) => {
      e.preventDefault();
      setFullName(fullName);
      setBranch(branch);
      setHtmlUrl(html);
      setActive(fullName);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const handleCheckboxClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckedItems({ ...checkedItems, [event.target.name]: event.target.checked });
  };
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.persist();
    debounceInputChange(event.currentTarget.value);
  };
  const debounceInputChange = useCallback(
    _.debounce(function (typed) {
      setTypedFilter(typed);
    }, 500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const render = () => {
    const filter1 = fastFilter((obj: RepoInfoProps) => {
      if (languageFilter.length > 0 && languageFilter.includes(obj.language)) {
        return obj;
      } else if (languageFilter.length === 0) {
        return obj;
      }
    }, state.repoInfo);
    const filter2 = fastFilter((obj: any) => {
      if (
        (typedFilter.length > 0 &&
          checkedItems.descriptionTitle &&
          !!obj.description &&
          obj.description.includes(typedFilter)) ||
        (checkedItems.descriptionTitle && !!obj.fullName && obj.fullName.includes(typedFilter)) ||
        (checkedItems.descriptionTitle && !!obj.topics && obj.topics.includes(typedFilter)) ||
        (checkedItems.readme && !!obj.readme && obj.readme.includes(typedFilter))
      ) {
        return obj;
      } else if (typedFilter.length === 0) {
        return obj;
      }
    }, filter1);
    return fastFilter((obj: any) => !!obj, filter2);
  };
  const defaultWidth = useRef(stateReducer?.get(displayName!)?.width || 0);
  const [drawerWidth, dragHandlers, drawerRef] = useDraggable({
    drawerWidthClient: defaultWidth.current,
  });
  useEffect(() => {
    if (stateReducer) {
      let total = 0;
      stateReducer.forEach((obj) => (total += obj.width));
      const res = stateReducer.set(
        displayName!,
        Object.assign({}, { name: displayName!, width: drawerWidth, draggerPosition: total })
      );
      dispatchReducer({ type: 'modify', payload: { columnWidth: res } });
    }
  }, [stateReducer.get('ColumnOne'), drawerWidth]);
  console.log(state.width, fullName);
  return (
    <div style={{ display: 'inline-flex', marginLeft: '2px' }}>
      <table>
        <thead>
          <tr>
            <th>
              <Search
                handleInputChange={handleInputChange}
                width={drawerWidth < defaultWidth.current ? defaultWidth.current : drawerWidth}
              />
              <p>Search in:</p>
              <Checkboxes checkedItems={checkedItems} handleCheckboxClick={handleCheckboxClick} />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ position: 'absolute' }}>
              <div
                style={{
                  width: `${drawerWidth < defaultWidth.current ? defaultWidth.current : drawerWidth}px`,
                  background: 'var(--background-theme-color)',
                  overflowY: 'auto',
                  height: height,
                  display: 'inline-block',
                }}
                ref={drawerRef}
              >
                {render().map((obj: RepoInfoProps, idx) => {
                  return (
                    <RepoInfo
                      active={active}
                      state={state}
                      obj={obj}
                      key={idx}
                      onClickRepoInfo={onClickRepoInfo}
                      dispatch={dispatch}
                    />
                  );
                })}
              </div>
            </td>
            <td style={{ paddingRight: '10px', paddingLeft: '10px' }}>
              <If condition={fullName !== '' && state.width > 850}>
                <Then>
                  <Details
                    fullName={fullName}
                    width={state.width}
                    branch={branch}
                    html_url={htmlUrl}
                    handleHeightChange={handleHeightChange}
                  />
                </Then>
              </If>
            </td>
          </tr>
        </tbody>
      </table>
      <DraggableCore key="columnTwo" {...dragHandlers}>
        <div style={{ height: '100vh', width: '0px' }}>
          <div
            className={'dragger'}
            style={{
              top: '40%',
              left: `${stateReducer?.get(displayName!)?.draggerPosition || 0}px`,
            }}
          />
        </div>
      </DraggableCore>
    </div>
  );
};
ColumnTwo.displayName = 'ColumnTwo';
export default ColumnTwo;
