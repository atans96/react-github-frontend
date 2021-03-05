const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    require: true,
    unique: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  tokenRSS: {
    type: String,
    default: "",
  },
  languagePreference: {
    type: [Object],
    default: [],
  },
  code: {
    type: String,
    default: "",
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
});
UserSchema.index({
  languagePreference: 1,
});
module.exports = mongoose.model("User", UserSchema);
