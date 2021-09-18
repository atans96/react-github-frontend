import React, { useEffect } from 'react';
import './LanguageListStyle.scss';
import { useTrackedStateShared, useTrackedStateStargazers } from '../../../../../selectors/stateContextSelector';
import { If } from '../../../../../util/react-if/If';
import { Then } from '../../../../../util/react-if/Then';
import { List, Option, useSelectContext } from '../../../../../util/react-listbox';
import { useClicked, useSelectedLanguage } from '../LanguageButtons';

const ListBoxes = ({ keys, index }: { keys: string; index: number }) => {
  const [stateStargazers, dispatchStargazers] = useTrackedStateStargazers();
  const [stateShared] = useTrackedStateShared();
  const [clicked, setClicked] = useClicked();
  const isFocused = stateStargazers.focusIndex === index;
  const style = { background: isFocused ? '#96CCFF' : '' };
  const [selectedLanguage, setSelectedLanguage] = useSelectedLanguage();
  const { dispatch } = useSelectContext();

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!clicked) {
      setClicked(true);
    } else {
      setClicked(false);
    }
    localStorage.setItem('language', e.currentTarget.innerText);
    dispatch({ type: 'collapse' });
    setSelectedLanguage(e.currentTarget.innerText);
    dispatchStargazers({
      type: 'SET_LANGUAGE',
      payload: {
        language: e.currentTarget.innerText,
      },
    });
    dispatch({ type: 'select index', payload: stateShared.githubLanguages.get(e.currentTarget.innerText)!.index });
  };
  return (
    <Option key={keys} value={keys} style={style}>
      <a href="/" onClick={handleClick}>
        <If condition={selectedLanguage === keys}>
          <Then>
            <span id="private-tick" className="glyphicon glyphicon-ok" />
          </Then>
        </If>
        {keys}
      </a>
    </Option>
  );
};

const RenderLanguageList = () => {
  const [, setClicked] = useClicked();
  const [stateStargazers] = useTrackedStateStargazers();
  const [stateShared] = useTrackedStateShared();
  const [, setSelectedLanguage] = useSelectedLanguage();
  const iterator1 = stateShared.githubLanguages[Symbol.iterator]();
  const iterate = () => {
    let output = [];
    for (const [key, value] of iterator1) {
      output.push(<ListBoxes index={value.index} key={key} keys={key} />);
    }
    return output;
  };
  useEffect(() => {
    return () => {
      setClicked(false);
    };
  }, []);
  useEffect(() => {
    let isFinished = false;
    if (!isFinished) setSelectedLanguage(stateStargazers.language);
    return () => {
      isFinished = true;
    };
  }, []);
  const { dispatch } = useSelectContext();
  useEffect(() => {
    let isFinished = false;
    if (stateShared.githubLanguages && !isFinished) {
      dispatch({ type: 'select index', payload: stateShared.githubLanguages.get(stateStargazers.language)!.index });
    }
    return () => {
      isFinished = true;
    };
  }, [stateShared.githubLanguages]);
  return (
    <th>
      <List className="dropdown-menu scrollable-menu">{React.useMemo(() => iterate(), [])}</List>
    </th>
  );
};
RenderLanguageList.displayName = 'RenderLanguageList';
export default React.memo(RenderLanguageList);
