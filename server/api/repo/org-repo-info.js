const util = require("../util");
const api = require("../../GithubAPIWrapper/index");
const fastJson = require("fast-json-stringify");
module.exports = async (req, res, ctx, ...args) => {
  console.log(ctx, args);
  const token = util.convertJWTToken(req.query.token);
  const gh = new args[0].github.Github({ token });
  const requestOne = gh.getOrganization(req.query.org).getRepos({
    page: req.query.page,
    per_page: req.query.per_page,
  });
  const stringify = fastJson({
    title: "Images Repo Info Schema",
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
    .all([requestOne])
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
