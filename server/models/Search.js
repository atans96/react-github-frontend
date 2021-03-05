const mongoose = require("mongoose");
const SearchSchema = new mongoose.Schema({
  userName: {
    type: String,
    require: true,
    unique: true,
  },
  searches: {
    type: [Object],
    default: [],
  },
});
SearchSchema.index({
  searches: 1,
});
module.exports = mongoose.model("Search", SearchSchema);
