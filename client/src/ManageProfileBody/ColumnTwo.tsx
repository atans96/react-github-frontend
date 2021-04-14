import React, { useCallback, useEffect, useState } from 'react';
import Search from './ColumnTwoBody/Search';
import Checkboxes from './ColumnTwoBody/Checkboxes';
import { RepoInfoProps } from '../typing/type';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
import _ from 'lodash';
import { fastFilter, isEqualObjects } from '../util';
import Details from './ColumnTwoBody/Details';
import RepoInfo from './ColumnTwoBody/RepoInfo';
import { useTrackedStateManageProfile, useTrackedStateShared } from '../selectors/stateContextSelector';
import { useDeepMemo } from '../hooks/useDeepMemo';
import { createRenderElement } from '../Layout/MasonryLayout';
import RowOne from './ColumnOneBody/RowOne';
import Contributor from './ColumnTwoBody/RepoInfoBody/ContributorsBody/Contributor';

interface ColumnTwoProps {
  languageFilter: string[];
}

const ColumnTwo: React.FC<ColumnTwoProps> = React.memo(
  ({ languageFilter }) => {
    const [state] = useTrackedStateManageProfile();
    const [stateShared] = useTrackedStateShared();
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

    return (
      <div style={{ display: 'inline-flex', marginLeft: '2px', marginTop: '10rem' }}>
        <table>
          <thead>
            <tr>
              <th>
                {createRenderElement(Search, {
                  handleInputChange,
                  width: 350,
                })}
                <p>Search in:</p>
                {createRenderElement(Checkboxes, {
                  checkedItems,
                  handleCheckboxClick,
                })}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ position: 'absolute' }}>
                <div
                  style={{
                    width: `350px`,
                    background: 'var(--background-theme-color)',
                    overflowY: 'auto',
                    height: height,
                    display: 'inline-block',
                  }}
                >
                  {useDeepMemo(() => {
                    return render().map((obj: RepoInfoProps, idx) => {
                      return createRenderElement(RepoInfo, {
                        active,
                        obj,
                        key: idx,
                        onClickRepoInfo,
                      });
                    });
                  }, [state.repoInfo, checkedItems, languageFilter])}
                </div>
              </td>
              <td style={{ paddingRight: '10px', paddingLeft: '10px' }}>
                <If condition={fullName !== '' && stateShared.width > 850}>
                  <Then>
                    {createRenderElement(Details, {
                      fullName,
                      branch,
                      html_url: htmlUrl,
                      handleHeightChange,
                      width: stateShared.width,
                    })}
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
    return isEqualObjects(prevProps.languageFilter, nextProps.languageFilter);
  }
);
ColumnTwo.displayName = 'ColumnTwo';
export default ColumnTwo;
