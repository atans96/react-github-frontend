const mongoose = require("mongoose");

const UserStarredSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      require: true,
      unique: true,
    },
    starred: {
      type: [Number],
      default: [],
    },
  },
  {
    collection: "userStarred", //need to match what's the database name in the mongoDB Compass
  }
);
module.exports = mongoose.model("UserStarred", UserStarredSchema);
