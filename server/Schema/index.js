const transform = require("../helpers/graphql-schema-to-json");
const fs = require("fs");
const path = require("path");
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
const SuggestedRepoImages = require("./SuggestedRepoImages");
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
  SuggestedRepoImages,
];
let all = [];
//exclude Root schema
for (const schema of schemaArrays.slice(1)) {
  const res = transform(schema);
  const properties = Object.entries(res.definitions).map(([, value]) => {
    if (!!value.properties) {
      return Object.entries(value.properties).map(([, value]) =>
        !!value.title ? value.title : ""
      );
    } else {
      return [];
    }
  });
  const result = [].concat.apply([], properties).filter((e) => !!e);
  all = all.concat([...new Set(result)]);
}
const file = fs.createWriteStream(
  path.resolve(__dirname, "..") + "/propertiesGQLData.txt"
);
[...new Set(all)].forEach(function (v) {
  file.write(v + "\n");
});
file.end();
module.exports = schemaArrays;
