const { gql } = require("apollo-server-fastify");
const Root = gql`
  type Query {
    root: String
  }
  type Mutation {
    root: String
  }
`;
module.exports = Root;
