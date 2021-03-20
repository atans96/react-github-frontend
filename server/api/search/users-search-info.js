const util = require("../util");
const fastJson = require("fast-json-stringify");
module.exports = async (req, res, ctx, ...args) => {
  const token = util.convertJWTToken(req.query.token);
  const gh = new args[0].github.Github({ token });
  const stringify = fastJson({
    title: "User Search Schema",
    type: "object",
    properties: {
      users: {
        type: "array",
      },
    },
  });
  const queryUser = gh
    .search({
      q: req.query.user,
    })
    .forUsers();
  args[0].axios
    .all([queryUser])
    .then(
      args[0].axios.spread((...responses) => {
        const responseOne = responses[0];
        const getUsers = responseOne.data.reduce((acc, item) => {
          const result = Object.assign({}, { [item.login]: item.avatar_url });
          acc.push(result);
          return acc;
        }, []);
        ctx.redis.setex(
          args[0].url,
          300 * 1000,
          stringify({
            users: getUsers,
          })
        );
        res.send({ users: getUsers });
      })
    )
    .catch((errors) => {
      util.sendErrorMessageToClient(errors, res);
      ctx.log.error(errors);
    });
};
