const Mutation = require("../../Resolvers/mutation/Mutation");
const { GITHUB_GRAPHQL } = require("../../helpers/constants");
module.exports = async (req, res, ctx, ...args) => {
  res.clearCookie(GITHUB_GRAPHQL);
  res.send("set cookie");
  console.log("YEEEE");
  // const valid = keys.reduce((acc, key) => {
  //   if (Object.keys(Mutation.Mutation).includes(key)) {
  //     acc.push(key);
  //   }
  //   return acc;
  // }, []);
  // valid.forEach((key) => {
  //   redis.get(key, function (err, res) {
  //     args[0].eventEmitter.emit(key, { data: JSON.parse(res) });
  //     console.log(res);
  //   });
  // });
};
