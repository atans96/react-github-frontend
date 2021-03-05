const util = require("../util");
module.exports = async (req, res, ctx, ...args) => {
  args[0].axios
    .put(
      `https://api.github.com/user/starred/${req.query.repoFullName}`,
      null,
      {
        headers: {
          authorization: `Bearer ${req.query.token}`,
        },
      }
    )
    .then((xx) => {
      if (xx.status === 204) {
        res.send({
          status: 200,
        });
      }
    })
    .catch((err) => {
      ctx.log.error(err);
    });
};
