const util = require("../util");
const _ = require("lodash");
const fastJson = require("fast-json-stringify");
module.exports = async (req, res, ctx, ...args) => {
  const token = util.convertJWTToken(req.query.token);
  const gh = new args[0].github.Github({ token }, args[0].axios);
  const requestOne = gh.getUser(req.query.username).listStarredRepos({
    page: req.query.page,
    per_page: req.query.per_page,
  });
  const requestTwo = gh.getUser(req.query.username).listWatchedRepos({
    page: req.query.page,
    per_page: req.query.per_page,
  });
  const stringify = fastJson({
    title: "User Repo Info Schema",
    type: "object",
    properties: {
      dataOne: {
        type: "array",
      },
      paginationInfoData: {
        type: "integer",
      },
    },
  });
  args[0].axios
    .all([requestOne, requestTwo])
    .then(
      args[0].axios.spread(async (...responses) => {
        const responseOne = responses[0];
        const responseTwo = responses[1];

        //there is duplicate between starred and subscriptions git from user so to prevent that, use lodash
        const mergeData = _.uniqBy(
          [...responseOne.data, ...responseTwo.data],
          "id"
        );
        const paginationInfoData =
          +responseOne.paginationInfo.last + +responseTwo.paginationInfo.last;
        ctx.redis.setex(
          args[0].url,
          300 * 1000,
          stringify({
            dataOne: mergeData,
            paginationInfoData: paginationInfoData,
          })
        );
        //since axios.get return promise, we can execute them in parallel using Promise.all
        //so no need to create custom new Promise
        res.send(
          stringify({
            dataOne: mergeData,
            paginationInfoData: paginationInfoData,
          })
        );
      })
    )
    .catch((errors) => {
      util.sendErrorMessageToClient(errors, res);
      ctx.log.error(errors);
    });
};
