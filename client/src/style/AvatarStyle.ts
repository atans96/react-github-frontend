import styled from 'styled-components';
export const AvatarStyle = styled.img`
  /* make a square container */
  width: 44px;
  height: 44px;
  border-width: 5px;
  border-style: double;
  background: var(--instagram-theme-color);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#f09433', endColorstr='#bc1888',GradientType=1 );
  /* fill the container, preserving aspect ratio, and cropping to fit */
  background-size: cover;

  /* center the image vertically and horizontally */
  background-position: top center;

  /* round the edges to a circle with border radius 1/2 container size */
  border-radius: 50%;
  margin-left: 3px;
  clip-path: circle(65px at center);
  pointer-events: none;
`;
