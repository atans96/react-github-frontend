import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { getElasticSearchBertAutocomplete } from '../../services';
import { Then } from '../../util/react-if/Then';
import { Typography } from '@material-ui/core';
import { If } from '../../util/react-if/If';
import { useUserCardStyles } from '../DiscoverBody/CardDiscoverBody/UserCardStyle';
import { useClickOutside } from '../../hooks/hooks';
import { useSelector } from '../../selectors/stateSelector';
import { IAction, StaticState } from '../../typing/interface';
import { RepoInfoSuggested } from '../../typing/type';
import { ActionDiscover } from '../../store/Discover/reducer';
import { useDebouncedValue } from '../../util/util';

interface SearchBarProps {
  style: React.CSSProperties;
  dispatchDiscover: React.Dispatch<IAction<ActionDiscover>>;
  ref: any;
}

type SearchesData = {
  isSuggested: boolean;
  result: Array<{ full_name: string }>;
};
// separate setState from SearchBar so that SearchBar won't get rerender by onChange
const PureInputDiscover: React.FC<SearchBarProps> = React.forwardRef(({ style, dispatchDiscover }, ref) => {
  const abortController = new AbortController();
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(false);
  const [searchesData, setSearches] = useState<SearchesData>();
  const isInputFocused = useRef<HTMLInputElement>(null);
  const resultsRef = useRef(null);
  const debouncedValue = useDebouncedValue(query, 1000);
  const isFinished = useRef(false);

  useEffect(() => {
    return () => {
      isFinished.current = true;
      abortController.abort(); //cancel the fetch when the user go away from current page or when typing again to search
    };
  }, []);

  useEffect(() => {
    if (!isFinished.current && query.trim().length > 0 && debouncedValue && debouncedValue >= 0) {
      getElasticSearchBertAutocomplete(query.trim(), abortController.signal).then((data) => {
        if (abortController.signal.aborted) return;
        if (data.isSuggested.status) {
          data.result.unshift(
            Object.assign({}, { full_name: `No result found for ${query}. Did you mean ${data.isSuggested.text}?` })
          );
        }
        if (abortController.signal.aborted) {
          return;
        }
        setSearches(data);
        setVisible(true);
        dispatchDiscover({
          type: 'VISIBLE',
          payload: { visible: true },
        });
      });
    }
  }, [debouncedValue]);

  useImperativeHandle(
    ref,
    () => ({
      clearState() {
        setQuery('');
      },
      getState() {
        return query.trim();
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setQuery, query]
  );

  useClickOutside(resultsRef, () => {
    setVisible(false);
    dispatchDiscover({
      type: 'VISIBLE',
      payload: { visible: false },
    });
  });
  const onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.persist();
    setQuery(e.currentTarget.value);
  };
  const repoInfo = useSelector(
    (state: StaticState) => state.SuggestedRepo.suggestedData.getSuggestedRepo.repoInfoSuggested
  );
  const handleClick = (event: React.FormEvent) => (query: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (!query.includes('Did you mean')) {
      const res = repoInfo.filter((obj: RepoInfoSuggested) => obj.full_name === query);
      dispatchDiscover({
        type: 'MERGED_DATA_ADDED_DISCOVER',
        payload: {
          data: res,
          notificationDiscover: res.length === 0 ? `No data found for query: ${query}` : '',
        },
      });
      setQuery('');
      setVisible(false);
      dispatchDiscover({
        type: 'VISIBLE',
        payload: { visible: false },
      });
    }
  };
  const classes = useUserCardStyles({ avatarSize: 20 });
  return (
    <React.Fragment>
      <div className={'input-bar-container-control-searchbar'} style={style}>
        <div style={{ display: 'inline-block' }}>
          <input
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            value={query}
            ref={isInputFocused}
            onChange={onInputChange}
            onBlur={() => {
              setQuery('');
            }}
            style={query.length > 0 ? { width: `${65 + query.length * 2}px` } : { width: style.width }}
            type="text"
            className="input-multi"
            name="query"
            placeholder={'Search anything...'}
            required
          />
        </div>
      </div>
      <If condition={searchesData && searchesData?.result?.length > 0 && visible}>
        <Then>
          <div className="resultsContainer" style={style} ref={resultsRef}>
            <ul className={'results'}>
              {searchesData?.result?.map((search, idx) => {
                return (
                  <li key={idx} onClick={(e) => handleClick(e)(search.full_name)}>
                    <div className={classes.nameWrapper} style={{ float: 'none' }}>
                      <Typography variant="subtitle2" className={classes.typography}>
                        {search.full_name}
                      </Typography>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Then>
      </If>
    </React.Fragment>
  );
});
PureInputDiscover.displayName = 'PureInputDiscover';
export default PureInputDiscover;
