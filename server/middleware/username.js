const {
  MSGS: { INTERNAL_SERVER_ERROR },
} = require("../helpers/constants");
module.exports = async (req, res, ctx) => {
  try {
    const res = await ctx.db.user.getByUserName({
      username: req.query.username,
    });
    if (!res) {
      ctx.log.warn("attempt to access features without valid session");
      req.username = undefined;
    } else {
      req.username = res.userName;
    }
  } catch (e) {
    ctx.log.error(e);
    res.status(500);
    return res.send({ success: false, message: INTERNAL_SERVER_ERROR });
  }
};
