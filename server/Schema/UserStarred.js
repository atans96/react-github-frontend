const { gql } = require("apollo-server-fastify");
const UserStarred = gql`
  type UserStarred {
    userName: String!
    _id: ID
    starred: [Int]
  }
  extend type Mutation {
    starredMeAdded(starred: [Int]!): UserStarred
    starredMeRemoved(removeStarred: Int!): UserStarred
  }
  extend type Query {
    getUserInfoStarred: UserStarred
  }
`;
module.exports = UserStarred;
