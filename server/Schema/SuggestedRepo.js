const { gql } = require("apollo-server-fastify");
const SuggestedRepo = gql`
  type RepoInfo {
    from: String!
    is_seen: Boolean!
    stargazers_count: Int!
    full_name: String!
    default_branch: String!
    owner: Owner
    description: String
    language: String
    topics: [String]
    html_url: String!
    id: Int!
    name: String!
  }
  type SuggestedRepo {
    userName: String!
    repoInfo: [RepoInfo]
  }
  extend type Query {
    getSuggestedRepo: SuggestedRepo
  }
`;
module.exports = SuggestedRepo;
