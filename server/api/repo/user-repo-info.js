const util = require("../util");
const _ = require("lodash");
const fastJson = require("fast-json-stringify");
module.exports = async (req, res, ctx, ...args) => {
  const token = util.convertJWTToken(req.query.token);
  const gh = new args[0].github.Github({ token });
  const requestOne = gh.getUser(req.query.username).listStarredRepos({
    page: req.query.page,
    per_page: req.query.per_page,
  });
  const requestTwo = gh.getUser(req.query.username).listWatchedRepos({
    page: req.query.page,
    per_page: req.query.per_page,
  });
  const stringify = fastJson({
    title: "User Repo Info Schema",
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
    .all([requestOne, requestTwo])
    .then(
      args[0].axios.spread(async (...responses) => {
        const responseOne = responses[0];
        const responseTwo = responses[1];

        //there is duplicate between starred and subscriptions git from user so to prevent that, use lodash
        const mergeData = _.uniqBy(
          [...responseOne.data, ...responseTwo.data],
          "id"
        );
        const imagesData = mergeData.reduce((acc, obj) => {
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
        const paginationInfoData =
          +responseOne.paginationInfo.last + +responseTwo.paginationInfo.last;
        let promises = [];
        let renderImages = [];
        if (!req.query.noImageQuery && token.length > 0) {
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
                    dataOne: mergeData,
                    paginationInfoData: paginationInfoData,
                  })
                );
                //since axios.get return promise, we can execute them in parallel using Promise.all
                //so no need to create custom new Promise
                res.send(
                  stringify({
                    renderImages: renderImages,
                    dataOne: mergeData,
                    paginationInfoData: paginationInfoData,
                  })
                );
              }
            })
            .catch((err) => {
              ctx.log.error(err);
            });
        } else {
          ctx.redis.setex(
            args[0].url,
            300 * 1000,
            stringify({
              renderImages: [],
              dataOne: mergeData,
              paginationInfoData: paginationInfoData,
            })
          );
          //since axios.get return promise, we can execute them in parallel using Promise.all
          //so no need to create custom new Promise
          res.send(
            stringify({
              renderImages: [],
              dataOne: mergeData,
              paginationInfoData: paginationInfoData,
            })
          );
        }
      })
    )
    .catch((errors) => {
      util.sendErrorMessageToClient(errors, res);
      ctx.log.error(errors);
    });
};
