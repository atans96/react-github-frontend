const util = require("../util");
module.exports = async (req, res, ctx, ...args) => {
  const token = util.convertJWTToken(req.query.token);
  const gh = new args[0].github.Github({ token });
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
        res.send({ users: getUsers });
      })
    )
    .catch((errors) => {
      ctx.log.error(errors);
    });
};
