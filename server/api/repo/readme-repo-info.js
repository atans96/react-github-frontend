const axios = require("axios");
const util = require("../util");
const fastJson = require("fast-json-stringify");
axios.defaults.withCredentials = true;

module.exports = async (req, res, ctx, ...args) => {
  const stringify = fastJson({
    title: "Readme Repo Info Schema",
    type: "object",
    properties: {
      readme: {
        type: "string",
      },
    },
  });
  const token = util.convertJWTToken(req.query.token);
  const readme = await args[0].github
    .MarkdownParser(req, res, args[0].axios)
    .doQueryWithoutImages(
      {
        full_name: req.query.full_name,
        branch: req.query.branch,
      },
      token
    );
  ctx.redis.setex(
    args[0].url,
    300 * 1000,
    stringify({
      readme,
    })
  );
  res.send({ readme });
};
