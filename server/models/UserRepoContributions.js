const mongoose = require("mongoose");

const UserRepoContributionsSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      require: true,
      unique: true,
    },
    repoContributions: {
      type: [Object],
      default: [],
    },
  },
  {
    collection: "userRepoContributions", //need to match what's the database name in the mongoDB Compass
  }
);
module.exports = mongoose.model(
  "UserRepoContributions",
  UserRepoContributionsSchema
);
