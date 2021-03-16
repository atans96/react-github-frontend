import React from 'react';
interface SearchProps {
  handleInputChange: any;
  width: number;
}
const Search: React.FC<SearchProps> = ({ handleInputChange, width }) => {
  return (
    <input
      autoCorrect="off"
      autoCapitalize="off"
      autoComplete="off"
      type="text"
      className="input-multi"
      name="query"
      placeholder={'Search...'}
      onChange={handleInputChange}
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
  );
};

export default Search;
