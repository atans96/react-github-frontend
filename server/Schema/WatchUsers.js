const { gql } = require("apollo-server-fastify");
const WatchUsers = gql`
  scalar Date
  directive @length(max: Int!) on FIELD_DEFINITION
  input WatchUsersInput {
    id: String
    login: String!
    createdAt: Date
    avatarUrl: String!
  }
  type Login {
    id: String!
    login: String!
    feeds: [String]! @length(max: 300)
    lastSeenFeeds: [String]! @length(max: 300)
    createdAt: Date
    avatarUrl: String!
  }
  type WatchUsers {
    userName: String!
    _id: ID
    login: [Login!]!
  }
  extend type Mutation {
    watchUsersAdded(login: WatchUsersInput!): WatchUsers
    watchUsersFeedsAdded(
      login: String!
      feeds: [String]!
      lastSeenFeeds: [String]!
    ): WatchUsers
    watchUsersRemoved(login: String!): Boolean
  }
  extend type Query {
    getWatchUsers: WatchUsers
  }
`;
module.exports = WatchUsers;
