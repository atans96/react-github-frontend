import styled, { css, keyframes } from 'styled-components';

const fadeInOpacity = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;
const dotAnimation = keyframes`
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;
export const spinnerAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;
const bangAnimation = keyframes`
  from {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
`;
const loadingAnimation = keyframes`
  0%,
  100% {
    box-shadow: 0em -2.6em 0em 0em #000000, 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2), 2.5em 0em 0 0em rgba(0, 0, 0, 0.2),
    1.75em 1.75em 0 0em rgba(0, 0, 0, 0.2), 0em 2.5em 0 0em rgba(0, 0, 0, 0.2), -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.2),
    -2.6em 0em 0 0em rgba(0, 0, 0, 0.5), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.7);
  }
  12.5% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.7), 1.8em -1.8em 0 0em #000000, 2.5em 0em 0 0em rgba(0, 0, 0, 0.2),
    1.75em 1.75em 0 0em rgba(0, 0, 0, 0.2), 0em 2.5em 0 0em rgba(0, 0, 0, 0.2), -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.2),
    -2.6em 0em 0 0em rgba(0, 0, 0, 0.2), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.5);
  }
  25% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.5), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.7), 2.5em 0em 0 0em #000000,
    1.75em 1.75em 0 0em rgba(0, 0, 0, 0.2), 0em 2.5em 0 0em rgba(0, 0, 0, 0.2), -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.2),
    -2.6em 0em 0 0em rgba(0, 0, 0, 0.2), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2);
  }
  37.5% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.2), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.5),
    2.5em 0em 0 0em rgba(0, 0, 0, 0.7), 1.75em 1.75em 0 0em #000000, 0em 2.5em 0 0em rgba(0, 0, 0, 0.2),
    -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.2), -2.6em 0em 0 0em rgba(0, 0, 0, 0.2), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2);
  }
  50% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.2), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2),
    2.5em 0em 0 0em rgba(0, 0, 0, 0.5), 1.75em 1.75em 0 0em rgba(0, 0, 0, 0.7), 0em 2.5em 0 0em #000000,
    -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.2), -2.6em 0em 0 0em rgba(0, 0, 0, 0.2), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2);
  }
  62.5% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.2), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2),
    2.5em 0em 0 0em rgba(0, 0, 0, 0.2), 1.75em 1.75em 0 0em rgba(0, 0, 0, 0.5), 0em 2.5em 0 0em rgba(0, 0, 0, 0.7),
    -1.8em 1.8em 0 0em #000000, -2.6em 0em 0 0em rgba(0, 0, 0, 0.2), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2);
  }
  75% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.2), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2),
    2.5em 0em 0 0em rgba(0, 0, 0, 0.2), 1.75em 1.75em 0 0em rgba(0, 0, 0, 0.2), 0em 2.5em 0 0em rgba(0, 0, 0, 0.5),
    -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.7), -2.6em 0em 0 0em #000000, -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2);
  }
  87.5% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.2), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2),
    2.5em 0em 0 0em rgba(0, 0, 0, 0.2), 1.75em 1.75em 0 0em rgba(0, 0, 0, 0.2), 0em 2.5em 0 0em rgba(0, 0, 0, 0.2),
    -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.5), -2.6em 0em 0 0em rgba(0, 0, 0, 0.7), -1.8em -1.8em 0 0em #000000;
  }
}
@keyframes load5 {
  0%,
  100% {
    box-shadow: 0em -2.6em 0em 0em #000000, 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2), 2.5em 0em 0 0em rgba(0, 0, 0, 0.2),
    1.75em 1.75em 0 0em rgba(0, 0, 0, 0.2), 0em 2.5em 0 0em rgba(0, 0, 0, 0.2), -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.2),
    -2.6em 0em 0 0em rgba(0, 0, 0, 0.5), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.7);
  }
  12.5% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.7), 1.8em -1.8em 0 0em #000000, 2.5em 0em 0 0em rgba(0, 0, 0, 0.2),
    1.75em 1.75em 0 0em rgba(0, 0, 0, 0.2), 0em 2.5em 0 0em rgba(0, 0, 0, 0.2), -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.2),
    -2.6em 0em 0 0em rgba(0, 0, 0, 0.2), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.5);
  }
  25% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.5), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.7), 2.5em 0em 0 0em #000000,
    1.75em 1.75em 0 0em rgba(0, 0, 0, 0.2), 0em 2.5em 0 0em rgba(0, 0, 0, 0.2), -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.2),
    -2.6em 0em 0 0em rgba(0, 0, 0, 0.2), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2);
  }
  37.5% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.2), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.5),
    2.5em 0em 0 0em rgba(0, 0, 0, 0.7), 1.75em 1.75em 0 0em #000000, 0em 2.5em 0 0em rgba(0, 0, 0, 0.2),
    -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.2), -2.6em 0em 0 0em rgba(0, 0, 0, 0.2), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2);
  }
  50% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.2), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2),
    2.5em 0em 0 0em rgba(0, 0, 0, 0.5), 1.75em 1.75em 0 0em rgba(0, 0, 0, 0.7), 0em 2.5em 0 0em #000000,
    -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.2), -2.6em 0em 0 0em rgba(0, 0, 0, 0.2), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2);
  }
  62.5% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.2), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2),
    2.5em 0em 0 0em rgba(0, 0, 0, 0.2), 1.75em 1.75em 0 0em rgba(0, 0, 0, 0.5), 0em 2.5em 0 0em rgba(0, 0, 0, 0.7),
    -1.8em 1.8em 0 0em #000000, -2.6em 0em 0 0em rgba(0, 0, 0, 0.2), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2);
  }
  75% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.2), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2),
    2.5em 0em 0 0em rgba(0, 0, 0, 0.2), 1.75em 1.75em 0 0em rgba(0, 0, 0, 0.2), 0em 2.5em 0 0em rgba(0, 0, 0, 0.5),
    -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.7), -2.6em 0em 0 0em #000000, -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2);
  }
  87.5% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.2), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2),
    2.5em 0em 0 0em rgba(0, 0, 0, 0.2), 1.75em 1.75em 0 0em rgba(0, 0, 0, 0.2), 0em 2.5em 0 0em rgba(0, 0, 0, 0.2),
    -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.5), -2.6em 0em 0 0em rgba(0, 0, 0, 0.7), -1.8em -1.8em 0 0em #000000;
  }
`;
export const LoadingMain = styled.div`
  margin: 100px auto;
  font-size: 10px;
  width: 1em;
  height: 1em;
  border-radius: 50%;
  position: relative;
  text-indent: -9999em;
  -webkit-animation: ${loadingAnimation} 1.1s infinite ease;
  animation: ${loadingAnimation} 1.1s infinite ease;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
`;
export const fadeIn = css`
  will-change: opacity;
  opacity: 1;
  animation-name: fadeInOpacity;
  animation-iteration-count: 1;
  animation-timing-function: ease-in;
  animation-duration: 0.5s;
  ${fadeInOpacity}
  }
`;
export const LoadingSpinner = styled.div`
  border: 2px solid #f3f3f3;
  border-top: 2px solid #000000;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  margin-right: 5px;
  animation: ${spinnerAnimation} 2s linear infinite;
  padding: 10px;
  position: relative;
`;
export const LoadingSpinnerWithText = styled.span`
  opacity: 0;
  will-change: opacity;
  -webkit-animation: ${dotAnimation} 1.3s infinite;
  -webkit-animation-delay: 0s;
  animation: ${dotAnimation} 1.3s infinite;
`;
export const ConfettiButton = css`
  @for $i from 1 through 50 {
    i:nth-of-type(#{$i}) {
      transform: translate3d(random(190) - 100 + px, random(200) - 100 + px, 0) rotate(random(360) + deg);
      background: hsla(random(360), 100%, 50%, 1);
      animation: ${bangAnimation} 700ms ease-out forwards;
      opacity: 0;
    }
  }
`;
