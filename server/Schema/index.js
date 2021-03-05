const Seen = require("./Seen");
const User = require("./User");
const UserLanguages = require("./UserLanguages");
const UserStarred = require("./UserStarred");
const RSSFeed = require("./RSSFeed");
const WatchUsers = require("./WatchUsers");
const Root = require("./Root");
const Search = require("./Search");
const Clicked = require("./Clicked");
const Suggested = require("./Suggested");
const SuggestedRepo = require("./SuggestedRepo");
const StarRanking = require("./StarRanking");
const schemaArrays = [
  Root,
  User,
  UserLanguages,
  UserStarred,
  Seen,
  RSSFeed,
  WatchUsers,
  Search,
  Clicked,
  Suggested,
  SuggestedRepo,
  StarRanking,
];
module.exports = schemaArrays;
