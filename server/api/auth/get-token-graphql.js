const { GITHUB_GRAPHQL } = require("../../helpers/constants");
module.exports = async (req, res, ctx, ...args) => {
  let tokenGQL = {};
  if (!!req.cookies[GITHUB_GRAPHQL]) {
    tokenGQL = req.unsignCookie(req.cookies[GITHUB_GRAPHQL]);
  }
  if (tokenGQL.valid) {
    res.send({
      tokenGQL: tokenGQL.value,
    });
  } else {
    res.send({
      tokenGQL: "",
    });
  }
};
