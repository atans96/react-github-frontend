const { gql } = require("apollo-server-fastify");
const SuggestedRepoImages = gql`
  type Images {
    id: Int!
    value: [String]!
  }
  type SuggestedRepoImages {
    userName: String!
    renderImages: [Images]
  }
  extend type Query {
    getSuggestedRepoImages: SuggestedRepoImages
  }
`;
module.exports = SuggestedRepoImages;
