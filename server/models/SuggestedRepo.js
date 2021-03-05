const mongoose = require("mongoose");
const SuggestedRepoSchema = new mongoose.Schema(
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
    collection: "suggestedRepo", //need to match what's the database name in the mongoDB Compass
  }
);
SuggestedRepoSchema.index({
  repoInfo: 1,
});
module.exports = mongoose.model("SuggestedRepo", SuggestedRepoSchema);
