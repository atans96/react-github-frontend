const axios = require("axios");
const util = require("../util");
const fastJson = require("fast-json-stringify");
axios.defaults.withCredentials = true;
module.exports = async (req, res, ctx, ...args) => {
  let promises = [];
  let renderImages = [];
  const token = util.convertJWTToken(req.body.token);
  promises = await args[0].github.doQuery(
    req.body.data,
    promises,
    renderImages,
    token,
    res
  );
  const stringify = fastJson({
    title: "Images Schema",
    type: "object",
    properties: {
      renderImages: {
        type: "array",
      },
    },
  });
  Promise.allSettled(promises)
    .then((result) => {
      let isError = false;
      for (let i = 0; i < result.length; i++) {
        if (result[i].status !== "fulfilled") {
          isError = true;
          break;
        }
      }
      if (isError) {
        res.send({
          error_403: true,
        });
      } else {
        ctx.redis.setex(
          args[0].url,
          300 * 1000,
          stringify({
            renderImages: renderImages,
          })
        );
        res.send(
          stringify({
            renderImages: renderImages,
          })
        );
      }
    })
    .catch((err) => {
      util.sendErrorMessageToClient(err, res);
      ctx.log.error(err);
    });
};
