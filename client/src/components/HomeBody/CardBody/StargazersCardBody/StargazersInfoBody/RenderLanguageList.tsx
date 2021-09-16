import React, { useEffect } from 'react';
import './LanguageListStyle.scss';
import { useTrackedStateShared, useTrackedStateStargazers } from '../../../../../selectors/stateContextSelector';
import { If } from '../../../../../util/react-if/If';
import { Then } from '../../../../../util/react-if/Then';
import { createStore } from '../../../../../util/hooksy';

const defaultSelectedLanguage: string = 'JavaScript';
export const [useSelectedLanguage] = createStore(defaultSelectedLanguage);

const RenderLanguageList = () => {
  const [stateStargazers, dispatchStargazers] = useTrackedStateStargazers();
  const [stateShared] = useTrackedStateShared();
  const [selectedLanguage, setSelectedLanguage] = useSelectedLanguage();
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem('language', e.currentTarget.innerText);
    dispatchStargazers({
      type: 'SET_DISPLAY',
      payload: {
        display: !stateStargazers.display,
      },
    });
    setSelectedLanguage(e.currentTarget.innerText);
    dispatchStargazers({
      type: 'SET_LANGUAGE',
      payload: {
        language: e.currentTarget.innerText,
      },
    });
  };

  const iterate = () => {
    let output = [];
    const iterator1 = stateShared.githubLanguages[Symbol.iterator]();
    for (const [key, value] of iterator1) {
      output.push(
        <li key={key}>
          <a href="/" onClick={handleClick}>
            <If condition={selectedLanguage === key}>
              <Then>
                <span id="private-tick" className="glyphicon glyphicon-ok" />
              </Then>
            </If>
            {key}
          </a>
        </li>
      );
    }
    return output;
  };

  useEffect(() => {
    setSelectedLanguage(stateStargazers.language);
  }, []);

  return (
    <th>
      <ul className="dropdown-menu scrollable-menu" style={{ display: stateStargazers.display ? 'block' : 'none' }}>
        {iterate()}
      </ul>
    </th>
  );
};
RenderLanguageList.displayName = 'RenderLanguageList';
export default React.memo(RenderLanguageList);
