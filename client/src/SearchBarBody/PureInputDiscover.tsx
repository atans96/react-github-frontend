import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import _ from 'lodash';
import { getElasticSearchBertAutocomplete } from '../services';
import { Then } from '../util/react-if/Then';
import { Typography } from '@material-ui/core';
import { If } from '../util/react-if/If';
import { useUserCardStyles } from '../HomeBody/CardBody/UserCardStyle';
import { dispatchVisible } from '../store/dispatcher';
import { useClickOutside } from '../hooks/hooks';
import { useSelector } from '../selectors/stateSelector';
import { StaticState } from '../typing/interface';
import { RepoInfoSuggested } from '../typing/type';

interface SearchBarProps {
  style: React.CSSProperties;
  dispatch: any;
  ref: any;
}

// separate setState from SearchBar so that SearchBar won't get rerender by onChange
export const PureInputDiscover: React.FC<SearchBarProps> = React.forwardRef(({ style, dispatch }, ref) => {
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(false);
  const [searchesData, setSearches] = useState([]);
  const isInputFocused = useRef<HTMLInputElement>(null);
  const resultsRef = useRef(null);
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
    dispatchVisible(false, dispatch);
  });
  const handler = useCallback(
    _.debounce(function (query) {
      if (query.trim().length > 0) {
        getElasticSearchBertAutocomplete(query.toString().trim()).then((data) => {
          setSearches(data);
          setVisible(true);
          dispatchVisible(true, dispatch);
        });
      }
    }, 200),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.persist();
    setQuery(e.currentTarget.value);
    handler(e.currentTarget.value);
  };
  const repoInfo = useSelector((state: StaticState) => state?.SuggestedRepo?.suggestedData?.getSuggestedRepo?.repoInfo);
  const handleClick = (event: React.FormEvent) => (query: string) => {
    event.preventDefault();
    event.stopPropagation();
    const res = repoInfo.filter((obj: RepoInfoSuggested) => obj.full_name === query);
    dispatch({
      type: 'MERGED_DATA_ADDED_DISCOVER',
      payload: {
        data: res,
        notificationDiscover: res.length === 0 ? `No data found for query: ${query}` : '',
      },
    });
    setQuery('');
    setVisible(false);
    dispatchVisible(false, dispatch);
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
      <If condition={searchesData && searchesData.length > 0 && visible}>
        <Then>
          <div className="resultsContainer" style={style} ref={resultsRef}>
            <ul className={'results'}>
              {searchesData.map((search: any, idx) => {
                let newBody;
                if (query.toString().trim().length > 0) {
                  newBody = search.full_name.replace(
                    new RegExp(query, 'gi'),
                    (match: any) => `<mark style="background: #2769AA; color: white;">${match}</mark>`
                  );
                } else {
                  newBody = search.full_name;
                }
                return (
                  <li key={idx} onClick={(e) => handleClick(e)(search.full_name)}>
                    <div className={classes.nameWrapper} style={{ float: 'none' }}>
                      <Typography variant="subtitle2" className={classes.typography}>
                        <div dangerouslySetInnerHTML={{ __html: newBody }} />
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
