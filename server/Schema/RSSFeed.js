const { gql } = require("apollo-server-fastify");
const RSSFeed = gql`
  type RSSFeed {
    userName: String!
    _id: ID
    rss: [String!] @length(max: 100)
    rssLastSeen: [String!] @length(max: 100)
  }
  extend type Mutation {
    rssFeedAdded(rss: [String!], rssLastSeen: [String!]): RSSFeed
  }
`;
module.exports = RSSFeed;
