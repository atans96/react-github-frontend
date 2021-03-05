const axios = require("axios");
const util = require("../util");
axios.defaults.withCredentials = true;
module.exports = async (req, res, ctx, ...args) => {
  let promises = [];
  let renderImages = [];
  const token = util.convertJWTToken(req.body.token);
  promises = await args[0].github.doQuery(
    req.body.data,
    promises,
    renderImages,
    token
  );
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
        res.send({
          renderImages: renderImages,
        });
      }
    })
    .catch((err) => {
      ctx.log.error(err);
    });
};
