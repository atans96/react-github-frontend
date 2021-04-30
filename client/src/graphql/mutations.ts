import { gql } from '@apollo/client';
//NOTE THAT mutation.ts and queries.ts gql schema must be the same if you use cache.writeQuery so that it won't query database again
export const SIGN_UP_USER = gql`
  mutation(
    $username: String!
    $avatar: String!
    $token: String!
    $languagePreference: [LanguagePreferenceInput]
    $code: String!
    $tokenRSS: String
  ) {
    signUp(
      tokenRSS: $tokenRSS
      username: $username
      avatar: $avatar
      token: $token
      languagePreference: $languagePreference
      code: $code
    ) {
      token
    }
  }
`;
export const SET_LANGUAGE_PREFERENCE = gql`
  mutation($languagePreference: [LanguagePreferenceInput]) {
    setLanguagePreference(languagePreference: $languagePreference) {
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
export const STARRED_ME_ADDED = gql`
  mutation($starred: [Int]!) {
    starredMeAdded(starred: $starred) {
      starred
    }
  }
`;
export const STARRED_ME_REMOVED = gql`
  mutation($removeStarred: Int!) {
    starredMeRemoved(removeStarred: $removeStarred) {
      starred
    }
  }
`;
export const RSS_FEED_ADDED = gql`
  mutation($rss: [String!], $lastSeen: [String!]) {
    rssFeedAdded(rss: $rss, lastSeen: $lastSeen) {
      rss
      lastSeen
    }
  }
`;
export const TOKEN_RSS_ADDED = gql`
  mutation($tokenRSS: String!) {
    tokenRSSAdded(tokenRSS: $tokenRSS)
  }
`;
export const WATCH_USERS_ADDED = gql`
  mutation($login: WatchUsersInput!) {
    watchUsersAdded(login: $login) {
      login {
        login
        feeds
        lastSeenFeeds
        avatarUrl
      }
    }
  }
`;
export const WATCH_USER_FEEDS_ADDED = gql`
  mutation($login: String!, $feeds: [String]!, $lastSeenFeeds: [String]!) {
    watchUsersFeedsAdded(login: $login, feeds: $feeds, lastSeenFeeds: $lastSeenFeeds) {
      login {
        login
        feeds
        lastSeenFeeds
      }
    }
  }
`;
export const WATCH_USER_REMOVED = gql`
  mutation($login: String!) {
    watchUsersRemoved(login: $login)
  }
`;
export const SEEN_ADDED = gql`
  mutation($seenCards: [SeenCardsInput]!) {
    seenAdded(seenCards: $seenCards) {
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
export const SEARCHES_ADDED = gql`
  mutation($search: [SearchesInput]!) {
    searchHistoryAdded(search: $search) {
      searches {
        search
        count
        updatedAt
      }
    }
  }
`;
export const CLICKED_ADDED = gql`
  mutation($clickedInfo: [ClickedInfoInput]!) {
    clickedAdded(clickedInfo: $clickedInfo) {
      clicked {
        full_name
      }
    }
  }
`;
