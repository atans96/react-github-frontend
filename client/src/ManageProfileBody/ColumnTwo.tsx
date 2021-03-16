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
  innerWidth: number;
  dispatch: any;
  columnOneWidth: number;
}

const ColumnTwo = React.memo<ColumnTwoProps>(
  ({ state, languageFilter, dispatch, innerWidth, columnOneWidth }) => {
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
    const drawerRef = useRef<HTMLDivElement>(null);
    const defaultWidth = useRef(innerWidth > 600 ? 350 : innerWidth - 300);
    const { dragHandlers, drawerWidth } = useDraggable(drawerRef, defaultWidth.current);
    return (
      <div style={{ display: 'inline-flex', marginLeft: '2px' }} ref={drawerRef}>
        <table>
          <thead>
            <tr>
              <th>
                <Search
                  handleInputChange={handleInputChange}
                  width={drawerWidth < defaultWidth.current ? defaultWidth.current : Math.min(drawerWidth, 600)}
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
                    width: `${
                      drawerWidth < defaultWidth.current ? defaultWidth.current : Math.min(drawerWidth, 600)
                    }px`,
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
              <td style={{ paddingRight: '10px', paddingLeft: '10px' }}>
                <If condition={fullName !== '' && innerWidth > 850}>
                  <Then>
                    <Details
                      fullName={fullName}
                      width={innerWidth}
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
        <If condition={drawerRef.current && drawerRef.current.getBoundingClientRect().left !== undefined}>
          <Then>
            <DraggableCore key="handle" {...dragHandlers}>
              <div
                className={'dragger'}
                style={{
                  left: `${
                    (drawerWidth < defaultWidth.current ? defaultWidth.current : Math.min(drawerWidth, 600)) +
                    columnOneWidth
                  }px`,
                }}
              />
            </DraggableCore>
          </Then>
        </If>
      </div>
    );
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.state, nextProps.state) &&
      isEqualObjects(prevProps.innerWidth, nextProps.innerWidth) &&
      isEqualObjects(prevProps.languageFilter, nextProps.languageFilter) &&
      isEqualObjects(prevProps.state, nextProps.state) &&
      isEqualObjects(prevProps.columnOneWidth, nextProps.columnOneWidth)
    );
  }
);
ColumnTwo.displayName = 'ColumnTwo';
export default ColumnTwo;
