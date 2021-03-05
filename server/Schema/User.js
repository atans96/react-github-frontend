const { gql } = require("apollo-server-fastify");
const User = gql`
  input LanguagePreferenceInput {
    language: String!
    checked: Boolean!
  }
  type LanguagePreference {
    language: String!
    checked: Boolean!
  }
  type User {
    userName: String!
    _id: ID
    avatar: String!
    token: String!
    tokenRSS: String
    joinDate: String
    languagePreference: [LanguagePreference]
  }
  type Token {
    token: String!
  }
  extend type Mutation {
    signUp(
      username: String!
      avatar: String!
      token: String!
      code: String!
      languagePreference: [LanguagePreferenceInput]
    ): Token
    tokenRSSAdded(tokenRSS: String!): Boolean
    setLanguagePreference(languagePreference: [LanguagePreferenceInput]): User
  }
  extend type Query {
    getUserData: User
  }
`;
module.exports = User;
