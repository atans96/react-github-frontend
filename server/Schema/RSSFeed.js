const { gql } = require("apollo-server-fastify");
const RSSFeed = gql`
  type RSSFeed {
    userName: String!
    _id: ID
    rss: [String!] @length(max: 300)
    lastSeen: [String!] @length(max: 300)
  }
  extend type Mutation {
    rssFeedAdded(rss: [String!], lastSeen: [String!]): RSSFeed
  }
`;
module.exports = RSSFeed;
