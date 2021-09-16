import React, { useEffect, useRef } from 'react';
import './LanguageListStyle.scss';
import { StargazerProps } from '../../../../../typing/type';
import { fastFilter } from '../../../../../util';
import { useTrackedStateStargazers } from '../../../../../selectors/stateContextSelector';
import { useSelectedLanguage } from './RenderLanguageList';
import { useOuterClick } from '../../../../../hooks/hooks';

const LanguagesList = () => {
  const abortController = new AbortController();
  const [stateStargazers, dispatchStargazers] = useTrackedStateStargazers();
  const evenOdd = useRef(0);
  const [selectedLanguage] = useSelectedLanguage();

  const handleClickSort = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const temp = stateStargazers.stargazersData.reduce((acc: any[], stargazer: StargazerProps) => {
      const temp = stargazer.starredRepositories.nodes.map(
        (obj: any) => obj.languages.nodes.map((obj: any) => obj.name)[0]
      );
      const languages = fastFilter((language: string) => language === stateStargazers.language, temp);
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
    const result: any[] = [];
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

  useEffect(() => {
    return () => {
      console.log('abort');
      abortController.abort(); //cancel the fetch when the user go away from current page or when typing again to search
    };
  }, []);

  const innerRef = useOuterClick(() =>
    dispatchStargazers({
      type: 'SET_DISPLAY',
      payload: {
        display: false,
      },
    })
  ) as any;
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
        ref={innerRef}
        onClick={() => {
          dispatchStargazers({
            type: 'SET_DISPLAY',
            payload: {
              display: !stateStargazers.display,
            },
          });
        }}
      >
        <span className="caret" />
      </button>
    </div>
  );
};
LanguagesList.displayName = 'LanguagesList';
export default React.memo(LanguagesList);
