const mongoose = require("mongoose");
const SuggestedSchema = new mongoose.Schema(
  {
    loginUsers: {
      type: [Object],
      default: [],
    },
  },
  {
    collection: "suggested", //need to match what's the database name in the mongoDB Compass
  }
);
//Define our indexes for mongoDB query to make it faster
SuggestedSchema.index({
  loginUsers: 1,
});
module.exports = mongoose.model("Suggested", SuggestedSchema);
