import gql from 'graphql-tag';
import { enableExperimentalFragmentVariables } from 'graphql-tag';
enableExperimentalFragmentVariables();
export const rateLimitInfo = gql`
  fragment rateLimitInfo on RateLimit {
    limit
    remaining
    used
    resetAt
  }
`;
export const pageInfoCursorStargazers = gql`
  fragment pageInfoCursorStargazers on StargazerConnection {
    pageInfo {
      endCursor
      hasNextPage
      startCursor
    }
  }
`;
export const pageInfoCursor = gql`
  fragment pageInfoCursor on RepositoryTopicConnection {
    pageInfo {
      endCursor
      hasNextPage
      startCursor
    }
  }
`;
export const pageInfoStarred = gql`
  fragment pageInfoStarred on StarredRepositoryConnection {
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
