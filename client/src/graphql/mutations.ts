import { gql } from '@apollo/client';
//NOTE THAT mutation.ts and queries.ts gql schema must be the same if you use cache.writeQuery so that it won't query database again
export const SIGN_UP_USER = gql`
  mutation(
    $username: String!
    $avatar: String!
    $token: String!
    $languagePreference: [LanguagePreferenceInput]
    $code: String!
    $tokenRSS: String
  ) {
    signUp(
      tokenRSS: $tokenRSS
      username: $username
      avatar: $avatar
      token: $token
      languagePreference: $languagePreference
      code: $code
    ) {
      token
    }
  }
`;
