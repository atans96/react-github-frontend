const { gql } = require("apollo-server-fastify");
const RSSFeed = gql`
  type RSSFeed {
    userName: String!
    _id: ID
    rss: [String] @length(max: 300)
    lastSeen: [String] @length(max: 300)
  }
  extend type Query {
    getRSSFeed: RSSFeed @auth
  }
`;
module.exports = RSSFeed;
