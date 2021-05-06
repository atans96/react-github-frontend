const jwt = require("jsonwebtoken");
const tokenTransporter = {
  token: "",
  set tokenSetter(token) {
    this.token = token;
  },
  get tokenGetter() {
    return this.token;
  },
};
const sendErrorMessageToClient = (errors, res, rateLimit = {}) => {
  if (errors?.response?.status === 403) {
    res.send({
      error_403: true,
      rateLimit: rateLimit,
    });
  } else if (errors?.response?.status === 404) {
    res.send({
      error_404: true,
      rateLimit: rateLimit,
    });
  } else {
    res.send({
      error_message: errors,
    });
  }
};
const convertJWTToken = (token) => {
  try {
    if (token !== "") {
      return jwt.verify(token, process.env.JWT_SECRET).token;
    } else {
      return "";
    }
  } catch (e) {
    throw new Error(e.message);
  }
};
module.exports = {
  sendErrorMessageToClient,
  convertJWTToken,
  tokenTransporter,
};
