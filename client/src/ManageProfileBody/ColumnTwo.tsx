import React, { useCallback, useRef, useState } from 'react';
import Search from './ColumnTwoBody/Search';
import Checkboxes from './ColumnTwoBody/Checkboxes';
import { RepoInfoProps } from '../typing/type';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
import _ from 'lodash';
import { fastFilter, isEqualObjects } from '../util';
import { IState } from '../typing/interface';
import Details from './ColumnTwoBody/Details';
import RepoInfo from './ColumnTwoBody/RepoInfo';
import { useDraggable } from '../hooks/useDraggable';
import { DraggableCore } from 'react-draggable';

interface ColumnTwoProps {
  languageFilter: string[];
  state: IState;
  dispatch: any;
}

const ColumnTwo = React.memo<ColumnTwoProps>(
  ({ state, languageFilter, dispatch }) => {
    const [checkedItems, setCheckedItems] = useState<any>({ descriptionTitle: true, readme: true });
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
      debounceInputChange(event.target.value);
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
    const defaultWidth = useRef(350);
    const [drawerWidth, dragHandlers] = useDraggable({ drawerWidthClient: defaultWidth.current });
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
              <td>
                <DraggableCore key="columnTwo" {...dragHandlers}>
                  <div style={{ height: '100vh', width: '0px' }}>
                    <div
                      className={'dragger'}
                      style={{
                        top: '40%',
                      }}
                    />
                  </div>
                </DraggableCore>
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
      </div>
    );
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.state.contributors, nextProps.state.contributors) &&
      isEqualObjects(prevProps.languageFilter, nextProps.languageFilter) &&
      isEqualObjects(prevProps.state.width, nextProps.state.width)
    );
  }
);
ColumnTwo.displayName = 'ColumnTwo';
export default ColumnTwo;
