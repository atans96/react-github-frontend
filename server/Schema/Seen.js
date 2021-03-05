const { gql } = require("apollo-server-fastify");
const Seen = gql`
  input OwnerInput {
    login: String
    avatar_url: String
    html_url: String
  }
  input SeenCardsInput {
    stargazers_count: Int
    full_name: String
    owner: OwnerInput
    description: String
    language: String
    topics: [String]
    html_url: String
    name: String
    id: Int
    default_branch: String
    imagesData: [String]
    is_queried: Boolean
  }
  type Owner {
    login: String
    avatar_url: String
    html_url: String
  }
  type SeenCards {
    stargazers_count: Int
    full_name: String
    owner: Owner
    description: String
    language: String
    topics: [String]
    html_url: String
    name: String
    id: Int
    default_branch: String
    imagesData: [String]
    is_queried: Boolean
  }
  type Seen {
    userName: String!
    _id: ID!
    seenCards: [SeenCards]
  }
  extend type Mutation {
    seenAdded(seenCards: [SeenCardsInput]!): Seen
  }
  extend type Query {
    getSeen: Seen
  }
`;
module.exports = Seen;
