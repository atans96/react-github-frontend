import { gql } from '@apollo/client';
import { print } from 'graphql/language/printer';
export const GET_SEARCHES = gql`
  query {
    getSearches {
      searches {
        search
        count
        updatedAt
      }
    }
  }
`;
export const GET_STAR_RANKING = gql`
  query {
    getStarRanking {
      starRanking {
        trends {
          daily
          weekly
          monthly
          quarterly
          yearly
        }
        timeSeries {
          daily
          monthly {
            firstDay
            lastDay
            months
            year
          }
        }
        id
      }
    }
  }
`;
export const GET_SUGGESTED_REPO_IMAGES = gql`
  query {
    getSuggestedRepoImages {
      renderImages {
        value
        id
      }
    }
  }
`;
export const GET_SUGGESTED_REPO = gql`
  query {
    getSuggestedRepo {
      repoInfoSuggested {
        from
        is_seen
        stargazers_count
        full_name
        default_branch
        owner {
          login
          avatar_url
          html_url
        }
        description
        language
        topics
        html_url
        id
        name
      }
    }
  }
`;
export const GET_CLICKED = gql`
  query {
    getClicked {
      clicked {
        is_queried
        full_name
        count
        dateClicked
        owner {
          login
        }
      }
    }
  }
`;
export const GET_RSS_FEED = gql`
  query {
    getRSSFeed {
      rss
      lastSeen
    }
  }
`;
export const GET_SEEN = gql`
  query {
    getSeen {
      seenCards {
        stargazers_count
        full_name
        default_branch
        owner {
          login
          avatar_url
          html_url
        }
        description
        language
        topics
        html_url
        name
        id
        is_queried
      }
    }
  }
`;
export const GET_USER_STARRED = gql`
  query {
    getUserInfoStarred {
      starred {
        is_queried
        full_name
      }
    }
  }
`;
export const GET_USER_INFO_DATA = gql`
  query {
    getUserInfoData {
      repoInfo {
        fullName
        description
        stars
        forks
        updatedAt
        language
        topics
        defaultBranch
        html_url
        readme
      }
      repoContributions {
        fullName
        contributors {
          login
          avatar_url
          contributions
        }
      }
      languages
    }
  }
`;
export const GET_USER_DATA = gql`
  query {
    getUserData {
      userName
      avatar
      languagePreference {
        language
        checked
      }
    }
  }
`;
export const SEARCH_FOR_REPOS = gql`
  query ($reponame: String!, $owner: String!, $stargazersCount: Int!, $starredRepoCount: Int!) {
    repository(name: $reponame, owner: $owner) {
      stargazers(first: $stargazersCount) {
        nodes {
          starredRepositories(first: $starredRepoCount) {
            nodes {
              languages(first: 10) {
                edges {
                  node {
                    name
                  }
                  size
                }
              }
            }
          }
          id
          avatarUrl
          login
        }
        pageInfo {
          endCursor
          hasNextPage
          startCursor
        }
      }
    }
    rateLimit {
      limit
      remaining
      used
      resetAt
    }
  }
`;
export const SEARCH_FOR_MORE_REPOS = gql`
  query ($reponame: String!, $owner: String!, $stargazersCount: Int!, $starredRepoCount: Int!, $after: String!) {
    repository(name: $reponame, owner: $owner) {
      stargazers(first: $stargazersCount, after: $after) {
        nodes {
          starredRepositories(first: $starredRepoCount) {
            nodes {
              languages(first: 10) {
                edges {
                  node {
                    name
                  }
                  size
                }
              }
            }
          }
          id
          avatarUrl
          login
        }
        pageInfo {
          endCursor
          hasNextPage
          startCursor
        }
      }
    }
    rateLimit {
      limit
      remaining
      used
      resetAt
    }
  }
`;
export const SEARCH_FOR_TOPICS = `
  query ($queryTopic: String!, $perPage: Int!) {
    search(query: $queryTopic, type: REPOSITORY, first: $perPage) {
      repositoryCount
      nodes {
        ... on Repository {
          databaseId
          defaultBranchRef {
            name
          }
          stargazerCount
          nameWithOwner
          owner {
            login
            avatarUrl
            url
          }
          description
          languages(first: 10) {
            edges {
              node {
                name
              }
              size
            }
          }
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
          url
          name
        }
      }
      pageInfo {
        hasNextPage
        endCursor
        startCursor
      }
    }
    rateLimit {
      limit
      remaining
      used
      resetAt
    }
  }
`;
export const SEARCH_FOR_MORE_TOPICS = `
  query ($queryTopic: String!, $after: String!, $perPage: Int!) {
    search(query: $queryTopic, type: REPOSITORY, first: $perPage, after: $after) {
      repositoryCount
      nodes {
        ... on Repository {
          databaseId
          defaultBranchRef {
            name
          }
          stargazerCount
          nameWithOwner
          owner {
            login
            avatarUrl
            url
          }
          description
          languages(first: 10) {
            edges {
              node {
                name
              }
              size
            }
          }
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
          url
          name
        }
      }
      pageInfo {
        hasNextPage
        endCursor
        startCursor
      }
    }
    rateLimit {
      limit
      remaining
      used
      resetAt
    }
  }
`;
export const associate = {
  [print(GET_SEARCHES)]: 'getSearches',
  [print(GET_STAR_RANKING)]: GET_STAR_RANKING,
  [print(GET_SUGGESTED_REPO_IMAGES)]: GET_SUGGESTED_REPO_IMAGES,
  [print(GET_SUGGESTED_REPO)]: GET_SUGGESTED_REPO,
  [print(GET_CLICKED)]: 'getClicked',
  [print(GET_RSS_FEED)]: GET_RSS_FEED,
  [print(GET_SEEN)]: 'getSeen',
  [print(GET_USER_STARRED)]: 'getUserInfoStarred',
  [print(GET_USER_INFO_DATA)]: 'getUserInfoData',
  [print(GET_USER_DATA)]: 'getUserData',
} as { [x: string]: string };
