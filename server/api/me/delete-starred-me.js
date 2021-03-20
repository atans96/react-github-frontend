const util = require("../util");
module.exports = async (req, res, ctx, ...args) => {
  args[0].axios
    .delete(`https://api.github.com/user/starred/${req.query.repoFullName}`, {
      headers: {
        authorization: `Bearer ${req.query.token}`,
      },
    })
    .then((xx) => {
      if (xx.status === 204) {
        res.send({
          status: 200,
        });
      }
    })
    .catch((err) => {
      util.sendErrorMessageToClient(err, res);
      ctx.log.error(err);
    });
};
