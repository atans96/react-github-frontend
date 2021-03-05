const mongoose = require("mongoose");
const RSSFeed = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  rss: {
    type: [String],
    default: [],
    maxlength: 100,
  },
  rssLastSeen: {
    type: [String],
    default: [],
    maxlength: 100,
  },
});
RSSFeed.index({
  rss: 1,
  rssLastSeen: 1,
});
module.exports = mongoose.model("RSSFeed", RSSFeed);
