const mongoose = require("mongoose");

const UserRepoInfoSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      require: true,
      unique: true,
    },
    repoInfo: {
      type: [Object],
      default: [],
    },
  },
  {
    collection: "userRepoInfo", //need to match what's the database name in the mongoDB Compass
  }
);
module.exports = mongoose.model("UserRepoInfo", UserRepoInfoSchema);
