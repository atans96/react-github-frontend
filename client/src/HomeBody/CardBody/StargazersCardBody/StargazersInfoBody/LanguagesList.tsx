import React, { useRef, useState } from 'react';
import { If } from '../../../../util/react-if/If';
import { Then } from '../../../../util/react-if/Then';
import './LanguageListStyle.scss';
import { IStateStargazers } from '../../../../typing/interface';
import { StargazerProps } from '../../../../typing/type';
import { languageList } from '../../../../util';

export interface LanguagesList {
  stateStargazers: IStateStargazers;
  dispatchStargazers: any;
}

const LanguagesList: React.FC<LanguagesList> = ({ stateStargazers, dispatchStargazers }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(stateStargazers.language);
  const evenOdd = useRef(0);
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    localStorage.setItem('language', e.currentTarget.innerText);
    setSelectedLanguage(e.currentTarget.innerText);
    dispatchStargazers({
      type: 'SET_LANGUAGE',
      payload: {
        language: e.currentTarget.innerText,
      },
    });
  };
  const handleClickSort = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const temp = stateStargazers.stargazersData.reduce((acc: any[], stargazer: StargazerProps) => {
      const languages = stargazer.starredRepositories.nodes
        .map((obj: any) => obj.languages.nodes.map((obj: any) => obj.name)[0])
        .filter((language: string) => language === stateStargazers.language);
      acc.push(Object.assign({}, { id: stargazer.id, languages: languages.length }));
      return acc;
    }, []);
    if (evenOdd.current % 2 === 0) {
      //the first click start at 0 will sort from bigger to smaller
      temp.sort((a: any, b: any) => {
        return b.languages - a.languages;
      });
    } else {
      temp.sort((a: any, b: any) => {
        //the second click start at odd will sort from smaller to bigger
        return a.languages - b.languages;
      });
    }
    let result: any[] = [];
    temp.forEach((key: any) => {
      stateStargazers.stargazersData.forEach((stargazer: StargazerProps) => {
        if (stargazer.id === key.id) {
          result.push(stargazer);
        }
      });
    });
    dispatchStargazers({
      type: 'STARGAZERS_SORTED_LANGUAGE',
      payload: {
        stargazersData: result,
      },
    });
    evenOdd.current += 1;
  };
  return (
    <div className="btn-group" style={{ display: 'flex', justifyContent: 'center', border: 'solid' }}>
      <button
        type="button"
        className="btn btn-default"
        onClick={handleClickSort}
        title={'Sort by language'}
        style={{ borderRadius: 0 }}
      >
        <span className={'glyphicon glyphicon-sort'} /> {selectedLanguage}
      </button>
      <button
        title={'Filter by language'}
        type="button"
        className="btn btn-default dropdown-toggle"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        style={{ borderRadius: 0 }}
      >
        <span className="caret" />
      </button>
      <ul className="dropdown-menu scrollable-menu">
        {languageList.map((language: string, idx: number) => {
          return (
            <li key={idx}>
              <a href="/" onClick={handleClick}>
                <If condition={selectedLanguage === language}>
                  <Then>
                    <span id="private-tick" className="glyphicon glyphicon-ok" />
                  </Then>
                </If>
                {language}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export default LanguagesList;
