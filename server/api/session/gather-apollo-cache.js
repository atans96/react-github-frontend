const { GITHUB_GRAPHQL } = require("../../helpers/constants");
module.exports = async (req, res, ctx, ...args) => {
  res.clearCookie(GITHUB_GRAPHQL);
  res.send("set cookie");
  let valid = new Map();
  let validKeys = [];
  for (const key of Object.keys(req.body)) {
    if (Object.keys(args[0].ApolloCache).includes(key)) {
      valid.set(key, req.body[key]);
      validKeys.push(key);
    }
  }
  validKeys.forEach((key) => {
    if (valid.get(key) && req.username && req.username.length > 0) {
      args[0].eventEmitter.emit(key, {
        username: req.username,
        data: JSON.stringify(valid.get(key)),
      });
    }
  });
};
