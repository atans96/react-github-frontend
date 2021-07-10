import React, { useState } from 'react';
import Search from './ColumnTwoBody/Search';
import Checkboxes from './ColumnTwoBody/Checkboxes';
import { RepoInfoProps } from '../typing/type';
import { debounce_lodash, fastFilter, useStableCallback } from '../util';
import { useTrackedStateManageProfile, useTrackedStateShared } from '../selectors/stateContextSelector';
import { useDeepMemo } from '../hooks/useDeepMemo';
import Loadable from 'react-loadable';
import Empty from '../Layout/EmptyLayout';

const Details = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "Details" */ './ColumnTwoBody/Details'),
});

const RepoInfo = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "RepoInfo" */ './ColumnTwoBody/RepoInfo'),
});

interface ColumnTwoProps {
  languageFilter: string[];
}

const ColumnTwo: React.FC<ColumnTwoProps> = ({ languageFilter }) => {
  const [state] = useTrackedStateManageProfile();
  const [stateShared] = useTrackedStateShared();
  const [checkedItems, setCheckedItems] = useState<any>({ descriptionTitle: true, readme: true });
  const [typedFilter, setTypedFilter] = useState('');
  const [active, setActive] = useState('');
  const [fullName, setFullName] = useState('');
  const [branch, setBranch] = useState('');
  const [htmlUrl, setHtmlUrl] = useState('');
  const onClickRepoInfo = useStableCallback(
    (e: React.MouseEvent) => (fullName: string, branch: string, html: string) => {
      e.preventDefault();
      setFullName(fullName);
      setBranch(branch);
      setHtmlUrl(html);
      setActive(fullName);
    }
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
  const debounceInputChange = useStableCallback(
    debounce_lodash(function (typed: string) {
      setTypedFilter(typed);
    }, 500)
  );
  //TODO: below ColumnTwo, show infinite scroll sliding window to show trending users/gists
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
              <Search handleInputChange={handleInputChange} width={350} />
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
                  width: `350px`,
                  background: 'var(--background-theme-color)',
                  overflowY: 'auto',
                  height: '80vh',
                  display: 'inline-block',
                }}
              >
                {useDeepMemo(() => {
                  return render().map((obj: RepoInfoProps, idx) => (
                    <RepoInfo active={active} obj={obj} key={idx} onClickRepoInfo={onClickRepoInfo} />
                  ));
                }, [state.repoInfo, checkedItems, languageFilter])}
              </div>
            </td>
            <td style={{ paddingRight: '10px', paddingLeft: '10px' }}>
              {fullName !== '' && stateShared.width > 850 && (
                <Details fullName={fullName} branch={branch} html_url={htmlUrl} width={stateShared.width} />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
ColumnTwo.displayName = 'ColumnTwo';
export default ColumnTwo;
