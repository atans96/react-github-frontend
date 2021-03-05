const { GITHUB_GRAPHQL } = require("../../helpers/constants");
module.exports = async (req, res, ctx, ...args) => {
  res.clearCookie(GITHUB_GRAPHQL);
  res.send("set cookie");
};
