const util = require("../util");
const fastJson = require("fast-json-stringify");
module.exports = async (req, res, ctx, ...args) => {
  const token = util.convertJWTToken(req.query.token);
  const gh = new args[0].github.Github({ token });
  const queryTopic = gh
    .search({
      q: req.query.topic,
    })
    .forRepositories();
  const stringify = fastJson({
    title: "Topics Info Schema",
    type: "object",
    properties: {
      renderImages: {
        type: "array",
      },
      dataOne: {
        type: "array",
      },
      paginationInfoData: {
        type: "integer",
      },
    },
  });
  args[0].axios
    .all([queryTopic])
    .then(
      args[0].axios.spread(async (...responses) => {
        const responseOne = responses[0];
        const imagesData = responseOne.data.reduce((acc, obj) => {
          const temp = Object.assign(
            {},
            {
              id: obj.id,
              value: {
                full_name: obj.full_name,
                branch: obj.default_branch,
              },
            }
          );
          acc.push(temp);
          return acc;
        }, []);
        const paginationInfoData = +responseOne.paginationInfo.last;
        let promises = [];
        let renderImages = [];
        promises = await args[0].github.doQuery(
          imagesData,
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
              ctx.redis.setex(
                args[0].url,
                300 * 1000,
                stringify({
                  renderImages: renderImages,
                  dataOne: responseOne.data,
                  paginationInfoData: paginationInfoData,
                })
              );
              //since axios.get return promise, we can execute them in parallel using Promise.all
              //so no need to create custom new Promise
              res.send({
                renderImages: renderImages,
                dataOne: responseOne.data,
                paginationInfoData: paginationInfoData,
              });
            }
          })
          .catch((err) => {
            ctx.log.error(err);
          });
      })
    )
    .catch((errors) => {
      util.sendErrorMessageToClient(errors, res);
      ctx.log.error(errors);
    });
};
