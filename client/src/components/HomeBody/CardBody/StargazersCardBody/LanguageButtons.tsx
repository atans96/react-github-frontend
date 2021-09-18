import React from 'react';
import './StargazersInfoStyle.scss';
import LanguagesList from './StargazersInfoBody/LanguagesList';
import { Select } from '../../../../util/react-listbox';
import { createStore } from '../../../../util/hooksy';
import Loadable from 'react-loadable';
import Empty from '../../../Layout/EmptyLayout';
import { useTrackedStateStargazers } from '../../../../selectors/stateContextSelector';
const RenderLanguageList = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "RenderLanguageList" */ './StargazersInfoBody/RenderLanguageList'),
});
const defaultSelectedLanguage: string = localStorage.getItem('language') || 'JavaScript';
export const [useSelectedLanguage] = createStore(defaultSelectedLanguage);
const defaultClicked: boolean = false;
export const [useClicked] = createStore(defaultClicked);

const LanguageButtons = () => {
  const [clicked, setClicked] = useClicked();
  const [, setSelectedLanguage] = useSelectedLanguage();
  const [, dispatchStargazers] = useTrackedStateStargazers();
  return (
    <Select
      onSelects={(option, exclude) => {
        if (exclude) {
          setClicked(false);
          localStorage.setItem('language', option.value as string);
          setSelectedLanguage(option.value as string);
          dispatchStargazers({
            type: 'SET_LANGUAGE',
            payload: {
              language: option.value,
            },
          });
          dispatchStargazers({
            type: 'SET_FOCUS_LANGUAGE',
            payload: {
              focusIndex: option.index,
            },
          });
        }
      }}
      onChange={() => {}}
    >
      <th style={{ width: '30%' }} className="sticky-column-table">
        <LanguagesList />
      </th>
      {clicked && <RenderLanguageList />}
    </Select>
  );
};
export default LanguageButtons;
