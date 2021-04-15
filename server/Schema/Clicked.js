const { gql } = require("apollo-server-fastify");
const Clicked = gql`
  input OwnerInputClicked {
    login: String
  }
  type OwnerClicked {
    login: String
  }
  input ClickedInfoInput {
    is_queried: Boolean
    full_name: String
    owner: OwnerInputClicked
  }
  type ClickedInfo {
    is_queried: Boolean
    full_name: String
    owner: OwnerClicked
  }
  type Clicked {
    userName: String!
    _id: ID!
    clicked: [ClickedInfo]
  }
  extend type Mutation {
    clickedAdded(clickedInfo: [ClickedInfoInput]!): Clicked @auth
  }
`;
module.exports = Clicked;
