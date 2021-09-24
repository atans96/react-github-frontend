import React, { useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '../../../util/util';
import { useTypedFilter } from '../ColumnTwo';

interface SearchProps {
  handleInputChange: any;
  width: number;
}
const Search: React.FC<SearchProps> = React.memo(
  ({ handleInputChange, width }) => {
    const [, setTypedFilter] = useTypedFilter();
    const [value, setValue] = useState('');
    const debouncedValue = useDebouncedValue(value, 1000);
    const isFinished = useRef(false);

    useEffect(() => {
      return () => {
        isFinished.current = true;
      };
    }, []);

    useEffect(() => {
      if (!isFinished.current && debouncedValue && debouncedValue >= 0) {
        handleInputChange(value);
      }
    }, [debouncedValue]);
    const typedRef = useRef('');
    const onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopPropagation();
      e.persist();
      setValue(e.currentTarget.value);
      typedRef.current = e.currentTarget.value;
    };
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTypedFilter(typedRef.current);
        }}
      >
        <input
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          type="text"
          className="input-multi"
          name="query"
          placeholder={'Search...'}
          value={value}
          onChange={onInputChange}
          style={{
            width: `${width}px`,
            backgroundColor: 'var(--background-theme-color)',
            appearance: 'none',
            borderWidth: '2px',
            borderRadius: '.25rem',
            padding: '.5rem 1rem',
            color: '#606f7b',
          }}
        />
      </form>
    );
  },
  (prev, next) => {
    return prev.width === next.width;
  }
);

export default Search;
