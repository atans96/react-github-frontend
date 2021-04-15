const { gql } = require("apollo-server-fastify");
const Suggested = gql`
  type LoginUsers {
    id: ID
    login: String
  }
  type Suggested {
    userName: String!
    loginUsers: [LoginUsers]
  }
  extend type Query {
    getSuggested(username: String!): Suggested @auth
  }
`;
module.exports = Suggested;
