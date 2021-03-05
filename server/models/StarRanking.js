const mongoose = require("mongoose");
const StarRankingSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      require: true,
      unique: true,
    },
    starRanking: {
      type: [Object],
      default: [],
    },
  },
  {
    collection: "starRanking",
  }
);
StarRankingSchema.index({
  starRanking: 1,
});
module.exports = mongoose.model("StarRanking", StarRankingSchema);
