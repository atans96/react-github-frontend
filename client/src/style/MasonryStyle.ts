import styled from 'styled-components';

export const MasonryContainerStyle = styled.div`
  display: flex;
  flex-wrap: wrap;
  word-wrap: break-word; //word-wrap: break-word to make sure to wrap text that is very long so that it won't go outside of card
  justify-content: center;
  .masonry-column {
    flex: 1 0;
  }
`;
