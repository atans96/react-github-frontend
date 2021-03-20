import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import _ from 'lodash';
import { getElasticSearchBert } from '../services';
import { Action, Nullable } from '../typing/type';
import { IDataOne } from '../typing/interface';

interface SearchBarProps {
  style: React.CSSProperties;
  dispatch: any;
  ref: any;
}

// separate setState from SearchBar so that SearchBar won't get rerender by onChange
export const PureInputDiscover: React.FC<SearchBarProps> = React.forwardRef(({ style, dispatch }, ref) => {
  const [query, setQuery] = useState('');
  const isInputFocused = useRef<HTMLInputElement>(null);
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
  const onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.persist();
    setQuery(e.currentTarget.value);
  };
  return (
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
  );
});
PureInputDiscover.displayName = 'PureInputDiscover';
