const mongoose = require("mongoose");
const SuggestedRepoImagesSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      require: true,
      unique: true,
    },
    renderImages: {
      type: [Object],
      default: [],
    },
  },
  {
    collection: "suggestedRepoImages", //need to match what's the database name in the mongoDB Compass
  }
);
SuggestedRepoImagesSchema.index({
  value: 1,
});
module.exports = mongoose.model(
  "SuggestedRepoImages",
  SuggestedRepoImagesSchema
);
