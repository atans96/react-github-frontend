const { gql } = require("apollo-server-fastify");
const Search = gql`
  input SearchesInput {
    search: String
    count: Int
    updatedAt: Date
  }
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
  extend type Mutation {
    searchHistoryAdded(search: [SearchesInput]!): Search
  }
  extend type Query {
    getSearches: [Searches]
  }
`;
module.exports = Search;
