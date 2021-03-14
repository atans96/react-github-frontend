import styled, { css } from 'styled-components';
import { ConfettiButton, fadeIn } from './Animation';
import { BackgroundDark, BackgroundLight } from './BackgroundColor';
import { LanguageGithubColor } from './LanguageGithubColor';
interface CardProps {
  visibility: Record<string, boolean>;
  isMobileScreen: Record<string, boolean>;
  darkMode?: boolean | undefined; //TODO: implement darkMode
  confetti: boolean;
}
export const LanguageStyle = styled.ul.attrs((props) => ({ className: props.className }))`
  font-size: 40px;
  text-align: left;
  width: min-content;
  margin: 0 auto;
  line-height: 44px;
  background-color: transparent;
  ${LanguageGithubColor}
`;
export const LanguageListStyle = styled.li`
  padding-left: 12px;
  &::marker {
    content: '•';
  }
  > h6 {
    transform: translate(-5px, -8px);
    color: black;
  }
  a {
    color: #cc4700;
    text-decoration: none;
    transition: all 0.3s;
    cursor: pointer;
  }
  a:hover {
    color: var(--bts-theme-color);
    text-decoration: underline;
  }
`;
export const CardDetails = styled.div`
  height: 35px;
  text-align: center;
  border: 3px solid #000000;
  justify-content: center;
  margin: 10px;
  border-radius: 4px;
  background: var(--instagram-theme-color);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#f09433', endColorstr='#bc1888',GradientType=1 );
  p {
    text-align: center;
    font-size: 16px;
    text-decoration: none;
    color: black;
    &:hover {
      text-decoration: underline;
      color: white;
      transition: all 0.3s;
    }
  }
`;
export const CardStyle = styled.div`
  padding: 0;
  height: 100%;
  width: 350px;
  max-width: 500px;
  border: 3px solid var(--border-theme-color);
  opacity: 1;
  visibility: visible;
  margin-top: 0;
  ${({ isMobileScreen: { isMobileScreen } }: Omit<CardProps, 'confetti'>) => (isMobileScreen ? CardMobileStyle : '')}
  ${({ visibility: { visibility } }: Omit<CardProps, 'confetti'>) =>
    visibility &&
    css`
      content-visibility: auto;
    `}
  ${(props: Omit<CardProps, 'confetti'>) =>
    props.darkMode === undefined || !props.darkMode ? BackgroundLight : BackgroundDark}
  ${fadeIn}
`;
const CardMobileStyle = css`
  width: 100%;
  max-width: 100%;
`;
export const StarCountText = styled.span`
  text-align: center;
  cursor: pointer;
  margin-left: 5px;
  margin-right: 5px;
  font-size: 15px;
  display: inline;
  text-decoration: none;
  color: blue;
  &:hover {
    text-decoration: underline;
    color: red;
  }
`;
export const StarContainer = styled.div`
  display: flex;
  text-align: center;
  margin-top: 1px;
  tab-index: 0;
  text-decoration: none;
  color: blue;
  &:hover {
    text-decoration: underline;
    color: red;
  }
  i {
    position: absolute;
    display: block;
    width: 5px;
    height: 10px;
    background: red;
    opacity: 0;
  }
  ${(props: Omit<CardProps, 'isMobileScreen' | 'visibility' | 'darkMode'>) => props.confetti && ConfettiButton}
`;
export const StargazersCardStyle = styled.div`
  text-align: center;
  border: solid;
  border-radius: 5px;
  max-width: fit-content;
  margin: auto;
  display: flex;
  svg:hover {
    path {
      fill: black;
      stroke: black;
      stroke-width: 4px;
      transform: scale(0.95);
      transition: all ease 0.3s;
    }
  }
`;
