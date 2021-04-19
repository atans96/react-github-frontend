module.exports = {
  repo: {
    UserRepoInfo: require("./api/repo/user-repo-info"),
    OrgRepoInfo: require("./api/repo/org-repo-info"),
    ContributorsRepoInfo: require("./api/repo/contributors-repo-info"),
    ReadmeRepoInfo: require("./api/repo/readme-repo-info"),
  },
  graphql: {
    GetGQLData: require("./api/graphql/get-data"),
  },
  search: {
    UsersSearchInfo: require("./api/search/users-search-info"),
    TopicsSearchInfo: require("./api/search/topics-search-info"),
  },
  rateLimit: {
    GetRateLimit: require("./api/rateLimit/get-rate-limit-info"),
  },
  auth: {
    GithubAccessToken: require("./api/auth/github-access-token"),
    VerifyJWTToken: require("./api/auth/verify-jwt-token"),
    TestTokenGQL: require("./api/auth/github-graphql-test-token"),
  },
  rssFeed: {
    SubscribeUserFeed: require("./api/rssFeed/subscribe-user-feed"),
  },
};
