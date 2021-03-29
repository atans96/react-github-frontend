import React, { useCallback, useEffect, useRef, useState } from 'react';
import Search from './ColumnTwoBody/Search';
import Checkboxes from './ColumnTwoBody/Checkboxes';
import { RepoInfoProps } from '../typing/type';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
import _ from 'lodash';
import { fastFilter, isEqualObjects } from '../util';
import { IAction, IStateManageProfile, IStateShared } from '../typing/interface';
import Details from './ColumnTwoBody/Details';
import RepoInfo from './ColumnTwoBody/RepoInfo';
import { useDraggable } from '../hooks/useDraggable';
import { DraggableCore } from 'react-draggable';
import { ActionShared } from '../store/Shared/reducer';
import { ActionManageProfile } from '../store/ManageProfile/reducer';
import { useLocation } from 'react-router-dom';
import { Action } from '../store/Home/reducer';

interface ColumnTwoProps {
  languageFilter: string[];
  stateManageProfile: IStateManageProfile;
  stateShared: IStateShared;
  dispatchManageProfile: React.Dispatch<IAction<ActionManageProfile>>;
  dispatchShared: React.Dispatch<IAction<ActionShared>>;
  dispatch: React.Dispatch<IAction<Action>>;
}

const ColumnTwo: React.FC<ColumnTwoProps> = React.memo(
  ({ stateShared, languageFilter, dispatchManageProfile, stateManageProfile, dispatchShared, dispatch }) => {
    const [checkedItems, setCheckedItems] = useState<any>({ descriptionTitle: true, readme: true });
    const displayName: string | undefined = (ColumnTwo as React.ComponentType<any>).displayName;
    const [typedFilter, setTypedFilter] = useState('');
    const [active, setActive] = useState('');
    const [height, setHeight] = useState('100vh');
    const [fullName, setFullName] = useState('');
    const [branch, setBranch] = useState('');
    const [htmlUrl, setHtmlUrl] = useState('');
    const location = useLocation();
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
    const render = (): RepoInfoProps[] => {
      const filter1 = fastFilter((obj: RepoInfoProps) => {
        if (languageFilter.length > 0 && languageFilter.includes(obj.language)) {
          return obj;
        } else if (languageFilter.length === 0) {
          return obj;
        }
      }, stateManageProfile.repoInfo);
      const filter2 = fastFilter((obj: RepoInfoProps) => {
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
      return fastFilter((obj: RepoInfoProps) => !!obj, filter2);
    };
    const defaultWidth = useRef(stateManageProfile.columnWidth?.get(displayName!)?.width || 0);
    const [drawerWidth, dragHandlers, drawerRef] = useDraggable({
      drawerWidthClient: defaultWidth.current,
    });

    useEffect(() => {
      if (stateManageProfile.columnWidth && location.pathname === '/profile') {
        let total = 0;
        stateManageProfile.columnWidth.forEach((obj) => (total += obj.width));
        const res = stateManageProfile.columnWidth.set(
          displayName!,
          Object.assign({}, { name: displayName!, width: drawerWidth, draggerPosition: total })
        );
        dispatchManageProfile({ type: 'MODIFY', payload: { columnWidth: res } });
      }
    }, [stateManageProfile.columnWidth.get('ColumnOne'), drawerWidth, location.pathname]);

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
                        state={stateManageProfile}
                        obj={obj}
                        key={idx}
                        onClickRepoInfo={onClickRepoInfo}
                        dispatchShared={dispatchShared}
                        dispatch={dispatch}
                      />
                    );
                  })}
                </div>
              </td>
              <td style={{ paddingRight: '10px', paddingLeft: '10px' }}>
                <If condition={fullName !== '' && stateShared.width > 850}>
                  <Then>
                    <Details
                      fullName={fullName}
                      width={stateShared.width}
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
                left: `${stateManageProfile.columnWidth?.get(displayName!)?.draggerPosition || 0}px`,
              }}
            />
          </div>
        </DraggableCore>
      </div>
    );
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.stateShared, nextProps.stateShared) &&
      isEqualObjects(prevProps.stateManageProfile, nextProps.stateManageProfile) &&
      isEqualObjects(prevProps.languageFilter, nextProps.languageFilter)
    );
  }
);
ColumnTwo.displayName = 'ColumnTwo';
export default ColumnTwo;
