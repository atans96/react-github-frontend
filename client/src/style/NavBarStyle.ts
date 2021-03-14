import styled from 'styled-components';
interface NavBarStyleProps {
  shouldApply: boolean;
  marginLeft: number;
}
export const NavBarStyle = styled.div`
  position: relative;
  vertical-align: middle;
  z-index: 10;
  margin-bottom: 0;
  border: 0;
  margin-left: ${(props: NavBarStyleProps) => (props.shouldApply ? `${props.marginLeft}px` : 0)};
  ul {
    justify-content: center;
    display: flex;
    background: var(--navbar-theme-color);
    -webkit-box-shadow: 0 8px 6px -6px #999;
    -moz-box-shadow: 0 8px 6px -6px #999;
    box-shadow: 0 8px 6px -6px #999;
    li {
      padding: 10px;
      display: grid;
      align-items: center;
      justify-content: center;
      justify-items: center;
      a {
        vertical-align: middle;
        color: black;
        text-decoration: none;
        cursor: pointer;
      }
    }
    li.active {
      padding: 10px;
      border-bottom: 3px solid black;
      background: var(--instagram-theme-color);
      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#f09433', endColorstr='#bc1888',GradientType=1 );
    }
  }
`;
