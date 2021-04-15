const { gql } = require("apollo-server-fastify");
const UserStarred = gql`
  type UserStarred {
    userName: String!
    _id: ID
    starred: [Int]
  }
  extend type Mutation {
    starredMeAdded(starred: [Int]!): UserStarred @auth
    starredMeRemoved(removeStarred: Int!): UserStarred @auth
  }
  extend type Query {
    getUserInfoStarred: UserStarred @auth
  }
`;
module.exports = UserStarred;
