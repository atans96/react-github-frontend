const { gql } = require("apollo-server-fastify");
const UserLanguages = gql`
  type RepoInfos {
    fullName: String!
    description: String
    stars: Int!
    forks: Int!
    updatedAt: String!
    language: String
    topics: [String]
    defaultBranch: String!
    html_url: String!
    readme: String
  }
  type ContributorsRepo {
    login: String
    avatar_url: String
    contributions: Int
  }
  type Contributors {
    fullName: String
    contributors: [ContributorsRepo]
  }
  type UserLanguages {
    userName: String!
    _id: ID
    repoInfo: [RepoInfos]
    languages: [String]
    repoContributions: [Contributors]
  }
  extend type Query {
    getUserInfoData: UserLanguages
  }
`;
module.exports = UserLanguages;
