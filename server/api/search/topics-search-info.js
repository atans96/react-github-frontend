const util = require("../util");
const fastJson = require("fast-json-stringify");
module.exports = async (req, res, ctx, ...args) => {
  const token = util.convertJWTToken(req.query.token);
  const gh = new args[0].github.Github({ token });
  const queryTopic = gh
    .search({
      q: req.query.topic,
    })
    .forRepositories();
  const stringify = fastJson({
    title: "Topics Info Schema",
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
    .all([queryTopic])
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
