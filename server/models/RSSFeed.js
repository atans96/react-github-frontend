const mongoose = require("mongoose");
const RSSFeed = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  rss: {
    type: [String],
    default: [],
  },
  lastSeen: {
    type: [String],
    default: [],
  },
});
RSSFeed.index({
  rss: 1,
});
module.exports = mongoose.model("RSSFeed", RSSFeed);
