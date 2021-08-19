import React, { useEffect, useState } from 'react';
import { useDebouncedValue } from '../../../util/util';

interface SearchProps {
  handleInputChange: any;
  width: number;
}
const Search: React.FC<SearchProps> = React.memo(
  ({ handleInputChange, width }) => {
    const [value, setValue] = useState('');
    const debouncedValue = useDebouncedValue(value, 1000);

    useEffect(() => {
      let isFinished = false;
      if (!isFinished && debouncedValue?.length >= 0) {
        handleInputChange(value);
      }
      return () => {
        isFinished = true;
      };
    }, [debouncedValue]);

    const onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopPropagation();
      e.persist();
      setValue(e.currentTarget.value);
    };
    return (
      <form onSubmit={() => setValue('')}>
        <input
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          type="text"
          className="input-multi"
          name="query"
          placeholder={'Search...'}
          onBlur={() => {
            setValue('');
          }}
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
