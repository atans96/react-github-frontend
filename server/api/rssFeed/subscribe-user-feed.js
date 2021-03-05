const util = require("util");
module.exports = async (req, res, ctx, ...args) => {
  args[0]
    .axios({
      url: `https://github.com/${req.query.username}`,
      method: "GET",
      headers: {
        Accept: "application/atom+xml",
      },
    })
    .then((response) => {
      res.send({
        xmlFile: response.data,
      });
    })
    .catch((err) => {
      ctx.log.error(err);
    });
};
