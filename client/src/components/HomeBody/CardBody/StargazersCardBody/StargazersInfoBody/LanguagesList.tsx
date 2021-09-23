import React, { useEffect, useRef, useState } from 'react';
import './LanguageListStyle.scss';
import { StargazerProps } from '../../../../../typing/type';
import { fastFilter } from '../../../../../util';
import { useTrackedStateShared, useTrackedStateStargazers } from '../../../../../selectors/stateContextSelector';
import { useOuterClick } from '../../../../../hooks/hooks';
import { useSelectContext } from '../../../../../util/react-listbox';
import { useClicked, useSelectedLanguage } from '../LanguageButtons';

const LanguagesList = () => {
  const abortController = new AbortController();
  const [stateStargazers, dispatchStargazers] = useTrackedStateStargazers();
  const [stateShared] = useTrackedStateShared();
  const evenOdd = useRef(0);
  const [selectedLanguage] = useSelectedLanguage();

  const handleClickSort = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const temp = stateStargazers.stargazersData.reduce((acc: any[], stargazer: StargazerProps) => {
      let count = 0;
      const temp = stargazer.starredRepositories.nodes
        .map((obj) => Array.from(obj.languages.edges).sort((a, b) => b.size - a.size))
        .map((obj) => obj.map((obj) => obj.node.name));
      temp.forEach((arr) => {
        for (const lang of arr) {
          if (lang === stateStargazers.language) {
            count += 1;
            break;
          }
        }
      });
      acc.push(Object.assign({}, { id: stargazer.id, languages: count }));
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
      abortController.abort(); //cancel the fetch when the user go away from current page or when typing again to search
    };
  }, []);

  const { size, expanded, index, dispatch, labelId, buttonId } = useSelectContext();
  const [clicked, setClicked] = useClicked();
  const innerRef = useOuterClick(() => {
    dispatch({ type: 'collapse' });
    setClicked(false);
  }) as any;

  useEffect(() => {
    dispatchStargazers({
      type: 'SET_FOCUS_LANGUAGE',
      payload: {
        focusIndex: index,
      },
    });
  }, [index]);

  useEffect(() => {
    if (size === stateShared.githubLanguages.size) {
      dispatch({ type: 'expand' });
      dispatch({ type: 'reset_size' });
    }
  }, [size]);

  const onClick = () => {
    if (!clicked) {
      setClicked(true);
    } else {
      dispatch({ type: 'collapse' });
      setClicked(false);
    }
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
        className="btn btn-default dropdown-toggle"
        style={{ borderRadius: 0 }}
        id={buttonId}
        onClick={onClick}
        aria-haspopup="listbox"
        aria-expanded={expanded}
        aria-labelledby={`${labelId} ${buttonId}`}
        ref={innerRef}
      >
        <span className="caret" />
      </button>
    </div>
  );
};
LanguagesList.displayName = 'LanguagesList';
export default React.memo(LanguagesList);
