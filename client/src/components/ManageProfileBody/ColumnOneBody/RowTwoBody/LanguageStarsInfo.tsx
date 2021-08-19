import React, { useState } from 'react';
import { useTrackedStateShared } from '../../../../selectors/stateContextSelector';
import './LanguageStarsInfo.scss';

interface LanguageStarsInfoProps {
  languageStar: any;
  onClickLanguageStarInfo: any;
}

const LanguageStarsInfo: React.FC<LanguageStarsInfoProps> = ({ languageStar, onClickLanguageStarInfo }) => {
  const [clicked, setClicked] = useState(false);
  const [stateShared] = useTrackedStateShared();
  return (
    <tr
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClickLanguageStarInfo(event)(languageStar[0], !clicked);
        setClicked(!clicked);
      }}
      className={'language-stars-info'}
      style={{ backgroundColor: clicked ? 'antiquewhite' : '' }}
    >
      <th style={{ width: '80%' }}>{languageStar[0]}</th>
      <th
        style={{
          backgroundColor: stateShared.githubLanguages.get(languageStar[0])?.color,
        }}
        className={`badge language`}
      >
        {languageStar[1]}
      </th>
    </tr>
  );
};
LanguageStarsInfo.displayName = 'LanguageStarsInfo';
export default LanguageStarsInfo;
