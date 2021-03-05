const { gql } = require("apollo-server-fastify");
const StarRanking = gql`
  type Trends {
    daily: Int
    weekly: Int
    monthly: Int
    quarterly: Int
    yearly: Int
  }
  type Monthly {
    year: Int
    months: Int
    firstDay: Int
    lastDay: Int
    delta: Int
  }
  type TimeSeries {
    daily: [Int]
    monthly: [Monthly]
  }
  type StarRankingArray {
    id: Int!
    trends: Trends
    timeSeries: TimeSeries
  }
  type StarRanking {
    userName: String!
    starRanking: [StarRankingArray]
  }
  extend type Query {
    getStarRanking: StarRanking
  }
`;
module.exports = StarRanking;
