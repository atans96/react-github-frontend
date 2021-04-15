import gql from 'graphql-tag';
import { enableExperimentalFragmentVariables } from 'graphql-tag';
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
