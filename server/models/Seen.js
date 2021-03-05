const mongoose = require("mongoose");
const SeenSchema = new mongoose.Schema({
  userName: {
    type: String,
    require: true,
    unique: true,
  },
  seenCards: {
    type: [Object],
    default: [],
  },
});
SeenSchema.index({
  seenCards: 1,
});
module.exports = mongoose.model("Seen", SeenSchema);
