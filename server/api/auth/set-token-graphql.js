const { GITHUB_GRAPHQL } = require("../../helpers/constants");
module.exports = async (req, res, ctx, ...args) => {
  res.setCookie(GITHUB_GRAPHQL, req.query.tokenGQL, {
    expires: new Date(10 * 365 * 24 * 60 * 60 * 1000),
    httpOnly: false,
    signed: true,
  });
  res.send("set cookie");
};
