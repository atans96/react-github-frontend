const mongoose = require("mongoose");
const ClickedSchema = new mongoose.Schema({
  userName: {
    type: String,
    require: true,
    unique: true,
  },
  clicked: {
    type: [Object],
    default: [],
  },
});
ClickedSchema.index({
  clicked: 1,
});
module.exports = mongoose.model("Clicked", ClickedSchema);
