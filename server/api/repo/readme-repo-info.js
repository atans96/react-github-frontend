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
  args[0].axios
    .get(args[0].urlReadMe)
    .then((response) => {
      ctx.redis.setex(
        args[0].url,
        300 * 1000,
        stringify({
          readme: response.data,
        })
      );
      res.send({ readme: response.data });
    })
    .catch((errors) => {
      ctx.log.error(errors);
    });
};
