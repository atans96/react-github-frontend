import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import _ from 'lodash';

interface SearchBarProps {
  style: React.CSSProperties;
  ref: any;
}

// separate setState from SearchBar so that SearchBar won't get rerender by onChange
export const PureInputDiscover: React.FC<SearchBarProps> = React.forwardRef(({ style }, ref) => {
  const [query, setQuery] = useState('');
  const isInputFocused = useRef<HTMLInputElement>(null);
  const handler = useCallback(
    _.debounce(function (query) {
      if (query.toString().trim().length > 0) {
        console.log(query);
      }
    }, 1500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useImperativeHandle(
    ref,
    () => ({
      clearState() {
        setQuery('');
        handler('');
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
    handler(e.currentTarget.value);
  };
  return (
    <div className={'input-bar-container-control-searchbar'} style={style}>
      <div style={{ display: 'inline-block' }}>
        <input
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          value={query}
          onChange={onInputChange}
          ref={isInputFocused}
          onBlur={() => {
            handler('');
            setQuery('');
          }}
          style={query.length > 0 ? { width: `${65 + query.length * 2}px` } : { width: style.width }}
          type="text"
          className="input-multi"
          name="query"
          placeholder={'Search anything...'}
        />
      </div>
    </div>
  );
});
PureInputDiscover.displayName = 'PureInputDiscover';
