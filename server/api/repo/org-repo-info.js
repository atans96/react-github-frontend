const util = require("../util");
const fastJson = require("fast-json-stringify");
module.exports = async (req, res, ctx, ...args) => {
  console.log(ctx, args);
  const token = util.convertJWTToken(req.query.token);
  const gh = new args[0].github.Github({ token });
  const requestOne = gh.getOrganization(req.query.org).getRepos({
    page: req.query.page,
    per_page: req.query.per_page,
  });
  const stringify = fastJson({
    title: "Images Repo Info Schema",
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
    .all([requestOne])
    .then(
      args[0].axios.spread(async (...responses) => {
        const responseOne = responses[0];
        const paginationInfoData = +responseOne.paginationInfo.last;
        ctx.redis.setex(
          args[0].url,
          300 * 1000,
          stringify({
            dataOne: responseOne.data,
            paginationInfoData: paginationInfoData,
          })
        );
        //since axios.get return promise, we can execute them in parallel using Promise.all
        //so no need to create custom new Promise
        res.send({
          dataOne: responseOne.data,
          paginationInfoData: paginationInfoData,
        });
      })
    )
    .catch((errors) => {
      util.sendErrorMessageToClient(errors, res);
      ctx.log.error(errors);
    });
};
