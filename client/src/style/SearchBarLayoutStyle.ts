import styled from 'styled-components';
//How to make overflow so that the long text will be scrolled
// https://dev.to/neshaz/the-guide-to-css-overflow-property-mg3
// https://stackoverflow.com/questions/17295219/overflow-scroll-css-is-not-working-in-the-div
interface SearchBarResultsProps {
  width: number;
}
export const SearchBarResults = styled.div`
  position: absolute;
  z-index: 9997;
  width: ${(props: SearchBarResultsProps) => `${props.width}px`};
  margin: 0;
  max-width: 100%;
  min-width: 100px;
`;
export const ResultsStyle = styled.ul`
  position: absolute;
  z-index: 9999;
  top: 0;
  width: 100%;
  margin: 0;
  padding: 0;
  background-color: #fff;
  border: 1px solid #ccc;
  border-top: none;
  min-width: auto;
  list-style-type: none;
  overflow: scroll;
  overflow-x: hidden;
  height: auto;
  max-height: 300px;
  min-height: 20px;
  > li {
    padding-top: 0.5em;
    padding-right: 0;
    padding-bottom: 0.5em;
    padding-left: 1em;
    z-index: 10;
    position: relative;
    cursor: pointer;
    border-bottom: 1px solid #999;
    &:after {
      content: '';
      display: table;
      clear: both;
    }
    &:hover {
      background-color: #fffee2;
    }
  }
  > li > div {
    float: left;
  }
`;
export const InputBarContainer = styled.div`
  -webkit-box-align: center;
  cursor: default;
  align-items: center;
  display: inline-flex;
  flex: 1 1 0%;
  background-color: var(--background-theme-color);
  border: 2px solid var(--border-theme-color);
  flex-wrap: wrap;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  border-bottom-left-radius: 4px;
  border-top-left-radius: 4px;
`;
export const InputMultiSelect = styled.input`
  border: 0;
  background-color: var(--background-theme-color);
  height: 30px;
  width: ${(props: SearchBarResultsProps) => `${props.width}px`};
  &:focus,
  :-webkit-autofill {
    outline: none;
    background: none;
  }
  &:-webkit-autofill,
  :-webkit-autofill:hover,
  :-webkit-autofill:focus,
  :-webkit-autofill:active {
    transition: background-color 5000s;
  }
`;
export const InputForm = styled.input`
  background-color: var(--background-theme-color);
  border: 2px solid var(--border-theme-color);
`;
export const SearchBarLayoutStyle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  position: relative;
  top: 50%;
  left: 50%;
  padding-top: 50px;
  padding-bottom: 50px;
  max-width: 1000px;
  width: ${(props: SearchBarResultsProps) => `${props.width}px`};
  transform: translate(-50%, -50%);
`;
