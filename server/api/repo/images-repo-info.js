const axios = require("axios");
const util = require("../util");
axios.defaults.withCredentials = true;

module.exports = async (req, res, ctx, ...args) => {
  let renderImages = [];
  const token = util.convertJWTToken(req.body.token);
  await args[0].github.MarkdownParser.doQuery(
    req.body.data,
    renderImages,
    token,
    { res }
  );
  ctx.redis.setex(
    args[0].url,
    300 * 1000,
    JSON.stringify({
      renderImages,
    })
  );
};
