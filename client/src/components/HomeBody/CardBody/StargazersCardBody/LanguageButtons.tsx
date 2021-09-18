import React from 'react';
import './StargazersInfoStyle.scss';
import LanguagesList from './StargazersInfoBody/LanguagesList';
import { Select } from '../../../../util/react-listbox';
import { createStore } from '../../../../util/hooksy';
import Loadable from 'react-loadable';
import Empty from '../../../Layout/EmptyLayout';
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
  const [clicked] = useClicked();
  return (
    <Select onChange={(option) => {}}>
      <th style={{ width: '30%' }} className="sticky-column-table">
        <LanguagesList />
      </th>
      {clicked && <RenderLanguageList />}
    </Select>
  );
};
export default LanguageButtons;
