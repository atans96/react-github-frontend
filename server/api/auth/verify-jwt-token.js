const { ForbiddenError } = require("apollo-server");
module.exports = async (req, res, ctx, ...args) => {
  if (req.query.username === undefined) {
    res.send({
      valid: false,
    });
  }
  try {
    const valid = await args[0].jwtService.verify(req.query.token);
    if (
      valid.exp > 0 &&
      valid.username === req.username &&
      req.query.username === req.username
    ) {
      res.send({
        valid: true,
        token: req.query.token,
        username: valid.username,
      });
    }
  } catch (e) {
    if (e.message === "TokenExpiredError" && !req.query.isLoggedIn) {
      res.send({
        valid: false,
      });
    } else if (e.message === "TokenExpiredError" && req.query.isLoggedIn) {
      if (req.username === req.query.username) {
        const newToken = args[0].jwtService.sign(
          { username: req.query.username },
          {
            expiresIn: "6hr",
          }
        );
        res.send({
          valid: true,
          token: newToken,
          username: newToken.username,
        });
      } else {
        res.send({
          valid: false,
        });
      }
    } else {
      throw new ForbiddenError("Unauthorized");
    }
  }
};
