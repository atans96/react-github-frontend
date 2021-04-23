const util = require("../util");
const jwt = require("jsonwebtoken");
module.exports = async (req, res, ctx, ...args) => {
  const { client_id, redirect_uri, client_secret, code } = req.body;
  const data = new FormData();
  data.append("client_id", client_id);
  data.append("client_secret", client_secret);
  data.append("code", code);
  data.append("redirect_uri", redirect_uri);

  // Request to exchange code for an access token
  fetch(`https://github.com/login/oauth/access_token`, {
    method: "POST",
    body: data,
  })
    .then((response) => response.text())
    .then((paramsString) => {
      //paramString will be:
      //access_token=eb2202a68eac4b9c65620bcb085241e4cd4c0e6564db&scope=user&token_type=bearer
      let params = new URLSearchParams(paramsString);
        util.tokenTransporter.tokenSetter = jwt.sign(
          {
              token: params.get("access_token"),
          },
          ctx.config.getJWTSecret()
      );
      // Request to return data of a user that has been authenticated
      return args[0].axios.get(`https://api.github.com/user`, {
        headers: {
          Authorization: `Bearer ${params.get("access_token")}`,
        },
      });
    })
    .then((response) => {
      res.send({
        data: response.data,
        token: util.tokenTransporter.tokenGetter,
      });
    })
    .catch((error) => {
      ctx.log.error(error);
      res.status(400).json(error);
    });
};
