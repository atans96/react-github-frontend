import gql from 'graphql-tag';
export const SIGN_UP_USER = gql`
  mutation(
    $username: String!
    $avatar: String!
    $token: String!
    $languagePreference: [LanguagePreferenceInput]
    $code: String!
  ) {
    signUp(username: $username, avatar: $avatar, token: $token, languagePreference: $languagePreference, code: $code) {
      token
    }
  }
`;
export const SET_LANGUAGE_PREFERENCE = gql`
  mutation($languagePreference: [LanguagePreferenceInput]) {
    setLanguagePreference(languagePreference: $languagePreference) {
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
      userName
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
        name
        id
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
