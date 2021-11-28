import React, { useState } from 'react';
import Search from './ColumnTwoBody/Search';
import Checkboxes from './ColumnTwoBody/Checkboxes';
import { RepoInfoProps } from '../../typing/type';
import { useStableCallback } from '../../util';
import { useTrackedStateManageProfile, useTrackedStateShared } from '../../selectors/stateContextSelector';
import Loadable from 'react-loadable';
import Empty from '../Layout/EmptyLayout';
import { filter, waterfall } from 'async';
import useDeepCompareEffect from '../../hooks/useDeepCompareEffect';
import RepoInfo from './ColumnTwoBody/RepoInfo';
import { createStore } from '../../util/hooksy';

const Details = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "Details" */ './ColumnTwoBody/Details'),
});

interface ColumnTwoProps {
  languageFilter: string[];
}
const defaultTypedFilter = '';
export const [useTypedFilter] = createStore(defaultTypedFilter);
const ColumnTwo: React.FC<ColumnTwoProps> = ({ languageFilter }) => {
  const [state] = useTrackedStateManageProfile();
  const [stateShared] = useTrackedStateShared();
  const [checkedItems, setCheckedItems] = useState<any>({ descriptionTitle: true, readme: true });
  const [typedFilter, setTypedFilter] = useTypedFilter();
  const [active, setActive] = useState('');
  const [fullName, setFullName] = useState('');
  const [renderJSX, setRenderJSX] = useState<any[]>([]);

  const [branch, setBranch] = useState('');
  const [htmlUrl, setHtmlUrl] = useState('');
  const onClickRepoInfo = useStableCallback(
    (e: React.MouseEvent) => (fullName: string, branch: string, html: string) => {
      e.preventDefault();
      e.stopPropagation();
      setFullName(fullName);
      setBranch(branch);
      setHtmlUrl(html);
      setActive(fullName);
    }
  );
  const handleCheckboxClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckedItems({ ...checkedItems, [event.target.name]: event.target.checked });
  };
  const handleInputChange = (typed: string) => {
    setTypedFilter(typed);
  };

  //TODO: below ColumnTwo, show infinite scroll sliding window to show trending users/gists
  useDeepCompareEffect(() => {
    if (state.repoInfo.length > 0) {
      waterfall(
        [
          function (callback: any) {
            filter(
              state.repoInfo,
              (obj: any, cb) => {
                if (languageFilter.length > 0 && languageFilter.includes(obj.language)) {
                  cb(null, obj);
                  return obj;
                } else if (languageFilter.length === 0) {
                  cb(null, obj);
                  return obj;
                } else {
                  cb(null, undefined);
                  return undefined;
                }
              },
              (err, res) => {
                if (err) {
                  new Error('err');
                }
                return callback(null, res);
              }
            );
          },
          function (res: any, callback: any) {
            filter(
              res,
              (obj: any, cb) => {
                if (
                  (typedFilter.length > 0 &&
                    checkedItems.descriptionTitle &&
                    !!obj.description &&
                    obj.description.includes(typedFilter)) ||
                  (checkedItems.descriptionTitle && !!obj.fullName && obj.fullName.includes(typedFilter)) ||
                  (checkedItems.descriptionTitle && !!obj.topics && obj.topics.includes(typedFilter)) ||
                  (checkedItems.readme && !!obj.readme && obj.readme.includes(typedFilter))
                ) {
                  cb(null, obj);
                  return obj;
                } else if (typedFilter.length === 0) {
                  cb(null, obj);
                  return obj;
                } else {
                  cb(null, undefined);
                  return undefined;
                }
              },
              (err, result) => {
                if (err) {
                  new Error('err');
                }
                return callback(null, result);
              }
            );
          },
        ],
        function (err, res: any) {
          setRenderJSX(res);
        }
      );
    }
  }, [state.repoInfo, checkedItems, languageFilter, typedFilter]);
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
                {React.useMemo(() => {
                  return renderJSX.map((obj: RepoInfoProps, idx) => (
                    <RepoInfo active={active} obj={obj} key={idx} onClickRepoInfo={onClickRepoInfo} />
                  ));
                }, [renderJSX.length])}
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
