const mongoose = require("mongoose");
const WatchUsers = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  login: {
    type: [
      {
        id: String,
        login: String,
        feeds: {
          type: [String],
          default: [],
          maxlength: 300,
        },
        lastSeenFeeds: {
          type: [String],
          default: [],
          maxlength: 300,
        },
        createdAt: {
          type: Date,
        },
        avatarUrl: {
          type: String,
          default: "",
        },
      },
    ],
    default: [],
    required: true,
  },
});
//Define our indexes for mongoDB query to make it faster
WatchUsers.index({
  login: 1,
});
module.exports = mongoose.model("WatchUsers", WatchUsers);
