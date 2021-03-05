import gql from 'graphql-tag';
export const GET_SEARCHES = gql`
  query {
    getSearches {
      search
      count
      updatedAt
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
export const GET_SUGGESTED_REPO = gql`
  query {
    getSuggestedRepo {
      repoInfo {
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
export const GET_WATCH_USERS = gql`
  query {
    getWatchUsers {
      login {
        login
        feeds
        lastSeenFeeds
        avatarUrl
      }
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
        imagesData
        is_queried
      }
    }
  }
`;
export const GET_USER_STARRED = gql`
  query {
    getUserInfoStarred {
      starred
    }
  }
`;
export const GET_USER_INFO_DATA = gql`
  query {
    getUserInfoData {
      userName
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
      token
      tokenRSS
      languagePreference {
        language
        checked
      }
    }
  }
`;
export const SEARCH_FOR_REPOS = gql`
  query($reponame: String!, $owner: String!, $stargazersCount: Int!, $starredRepoCount: Int!) {
    repository(name: $reponame, owner: $owner) {
      stargazers(first: $stargazersCount) {
        nodes {
          starredRepositories(first: $starredRepoCount) {
            nodes {
              languages(first: 1) {
                nodes {
                  name
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
  query($reponame: String!, $owner: String!, $stargazersCount: Int!, $starredRepoCount: Int!, $after: String!) {
    repository(name: $reponame, owner: $owner) {
      stargazers(first: $stargazersCount, after: $after) {
        nodes {
          starredRepositories(first: $starredRepoCount) {
            nodes {
              languages(first: 1) {
                nodes {
                  name
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
export const SEARCH_FOR_TOPICS = gql`
  query($queryTopic: String!, $perPage: Int!) {
    search(query: $queryTopic, type: REPOSITORY, last: $perPage) {
      nodes {
        ... on Repository {
          name
          nameWithOwner
          description
          id
          primaryLanguage {
            name
            color
          }
          stargazerCount
          url
          owner {
            avatarUrl
            id
            login
            url
          }
          defaultBranchRef {
            name
          }
          repositoryTopics(first: 2) {
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
          viewerHasStarred
        }
      }
      pageInfo {
        endCursor
        hasNextPage
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
export const SEARCH_FOR_MORE_TOPICS = gql`
  query($queryTopic: String!, $after: String!, $perPage: Int!) {
    search(query: $queryTopic, type: REPOSITORY, last: $perPage, after: $after) {
      nodes {
        ... on Repository {
          name
          nameWithOwner
          description
          id
          primaryLanguage {
            name
            color
          }
          stargazerCount
          url
          owner {
            avatarUrl
            id
            login
            url
          }
          defaultBranchRef {
            name
          }
          repositoryTopics(first: 2) {
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
          viewerHasStarred
        }
      }
      pageInfo {
        endCursor
        hasNextPage
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
