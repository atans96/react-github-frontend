const util = require("../util");
module.exports = async (req, res, ctx, ...args) => {
  const token = util.convertJWTToken(req.query.token);
  const gh = new args[0].github.Github({ token }, args[0].axios);
  const requestOne = gh.getRepo(req.query.fullName).getContributors();
  args[0].axios
    .all([requestOne])
    .then(
      args[0].axios.spread((...responses) => {
        const responseOne = responses[0];
        const data = responseOne.data.reduce((acc, obj) => {
          const temp = Object.assign(
            {},
            {
              login: obj.login,
              avatar_url: obj.avatar_url,
              contributions: obj.contributions,
            }
          );
          acc.push(temp);
          return acc;
        }, []);
        const result = Object.assign(
          {},
          { fullName: req.query.fullName, data: data }
        );
        res.send({
          data: result,
        });
        ctx.redis.setex(
          args[0].url,
          300 * 1000,
          JSON.stringify({
            data: result,
          })
        );
      })
    )
    .catch((errors) => {
      gh.getRateLimit()
        .getRateLimit()
        .then((responseOne) => {
          if (responseOne.status === 200) {
            const rateLimit = {
              limit: responseOne.data.resources.core.limit,
              used: responseOne.data.resources.core.used,
              reset: responseOne.data.resources.core.reset,
            };
            util.sendErrorMessageToClient(errors, res, rateLimit);
          }
        })
        .catch((err) => {
          util.sendErrorMessageToClient(err, res);
          ctx.log.error(err);
        });
    });
};
