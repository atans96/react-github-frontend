const { gql } = require("apollo-server-fastify");
const Clicked = gql`
  type OwnerClicked {
    login: String
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
  extend type Query {
    getClicked: Clicked @auth
  }
`;
module.exports = Clicked;
