const { gql } = require("apollo-server-fastify");
const Search = gql`
  type Searches {
    search: String
    count: Int
    updatedAt: Date
  }
  type Search {
    userName: String!
    _id: ID
    searches: [Searches]
  }
  extend type Query {
    getSearches: [Searches] @auth
  }
`;
module.exports = Search;
