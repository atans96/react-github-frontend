import React, { useState } from 'react';
import { isEqualObjects } from '../../../util';
import { useTrackedStateShared } from '../../../selectors/stateContextSelector';
interface LanguageStarsInfoProps {
  languageStar: any;
  onClickLanguageStarInfo: any;
}

const LanguageStarsInfo = React.memo<LanguageStarsInfoProps>(
  ({ languageStar, onClickLanguageStarInfo }) => {
    const [clicked, setClicked] = useState(false);
    const [stateShared] = useTrackedStateShared();
    return (
      <tr
        onClick={(event) => {
          event.preventDefault();
          onClickLanguageStarInfo(event)(languageStar[0], !clicked);
          setClicked(!clicked);
        }}
        className={'language-stars-info'}
        style={{ backgroundColor: clicked ? 'grey' : '' }}
      >
        <th style={{ width: '80%' }}>{languageStar[0]}</th>
        <th
          style={{
            backgroundColor: stateShared.githubLanguages.get(languageStar[0]?.replace(/\+\+|#|\s/, '-'))?.color,
          }}
          className={`badge language`}
        >
          {languageStar[1]}
        </th>
      </tr>
    );
  },
  (prevProps: any, nextProps: any) => {
    return isEqualObjects(prevProps.languageStar, nextProps.languageStar);
  }
);
LanguageStarsInfo.displayName = 'LanguageStarsInfo';
export default LanguageStarsInfo;
