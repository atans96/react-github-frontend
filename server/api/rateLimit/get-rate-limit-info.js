const util = require("../util");
module.exports = async (req, res, ctx, ...args) => {
  const token = util.convertJWTToken(req.query.token);
  const gh = new args[0].github.Github({ token });
  gh.getRateLimit()
    .getRateLimit()
    .then((responseOne) => {
      if (responseOne.status === 200) {
        res.send({
          rateLimit: {
            limit: responseOne.data.resources.core.limit,
            used: responseOne.data.resources.core.used,
            reset: responseOne.data.resources.core.reset,
          },
          rateLimitGQL: {
            limit: responseOne.data.resources.graphql.limit,
            used: responseOne.data.resources.graphql.used,
            reset: responseOne.data.resources.graphql.reset,
          },
          rateLimitSearch: {
            limit: responseOne.data.resources.search.limit,
            used: responseOne.data.resources.search.used,
            reset: responseOne.data.resources.search.reset,
          },
        });
      }
    })
    .catch((err) => {
      util.sendErrorMessageToClient(err, res);
      ctx.log.error(err);
    });
};
