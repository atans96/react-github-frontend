const fastifyPlugin = require("fastify-plugin");
const { Forbidden } = require("http-errors");
const csrf = fastifyPlugin((fastify, options, next) => {
  fastify.decorate("csrfProtection", function (req, res, done) {
    if (!["POST", "PUT", "DELETE"].includes(req.method)) {
      return done(new Forbidden("Invalid HTTP Method"));
    }
    if (req.headers["x-requested-with"] !== "XmlHttpRequest") {
      res.writeHead(403);
      return res.end();
    }
  });
  next();
});
module.exports = { csrf };
