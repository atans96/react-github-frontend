import { gql } from '@apollo/client';
import { enableExperimentalFragmentVariables } from '@apollo/client';
enableExperimentalFragmentVariables();
export const pageInfoCursor = gql`
  fragment pageInfoCursor on RepositoryTopicConnection {
    pageInfo {
      endCursor
      hasNextPage
      startCursor
    }
  }
`;
export const topic = gql`
  fragment topic on RepositoryTopicConnection {
    edges {
      node {
        topic {
          name
          relatedTopics {
            name
          }
        }
      }
    }
  }
`;
