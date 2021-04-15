module.exports = async (req, res, ctx, ...args) => {
  const userData = await ctx.db.user.getUserDataByUserName({
    username: req.username,
  });
  const userInfoData = await ctx.db.user.getUserInfoByUserName({
    username: req.username,
  });
  res.send(
    JSON.stringify({
      userData,
      userInfoData,
    })
  );
};
