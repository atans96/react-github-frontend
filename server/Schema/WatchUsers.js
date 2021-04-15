const { gql } = require("apollo-server-fastify");
const WatchUsers = gql`
  input WatchUsersInput {
    id: String
    login: String!
    createdAt: Date
    avatarUrl: String!
  }
  type Login {
    id: String!
    login: String!
    feeds: [String] @length(max: 300)
    lastSeenFeeds: [String] @length(max: 300)
    createdAt: Date
    avatarUrl: String!
  }
  type WatchUsers {
    userName: String!
    _id: ID
    login: [Login!]!
  }
  extend type Mutation {
    watchUsersAdded(login: WatchUsersInput!): WatchUsers @auth
    watchUsersFeedsAdded(
      login: String!
      feeds: [String]!
      lastSeenFeeds: [String]!
    ): WatchUsers @auth
    watchUsersRemoved(login: String!): Boolean @auth
  }
  extend type Query {
    getWatchUsers: WatchUsers @auth
  }
`;
module.exports = WatchUsers;
