const mongoose = require("mongoose");

const UserLanguagesSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      require: true,
      unique: true,
    },
    languages: {
      type: [String],
      default: [],
    },
    repoContributions: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserRepoContributions",
    },
    repoInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserRepoInfo",
    },
  },
  {
    collection: "userLanguages", //need to match what's the database name in the mongoDB Compass
  }
);
module.exports = mongoose.model("UserLanguages", UserLanguagesSchema);
