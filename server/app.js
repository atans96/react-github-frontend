const ajv = require("ajv");
const Fastify = require("fastify");
const routes = require("./routes");
const { configPlugin } = require("./decorators/config");
const { dbPlugin } = require("./decorators/db");
const { csrf } = require("./decorators/csrf");
const { apolloServerPlugin } = require("./decorators/apollo-server");
const helmet = require("fastify-helmet");

// Create custom ajv schema declaration to remove _all_ additional fields by default
const AJV = new ajv({
  removeAdditional: "all",
  useDefaults: true,
  coerceTypes: true,
  allErrors: true,
});
module.exports = async function buildFastify(deps) {
  const {
    config,
    axios,
    jwtService,
    db,
    githubAPIWrapper,
    elastic,
    logger = true,
    bodyLimit = 6000000000,
  } = deps;
  const fastify = Fastify({ logger, bodyLimit });
  const allowedOrigins = ["https://allan.com", "https://allantanaka.com"];
  let redisConfig = config.getLambdaStoreRedis();
  if (process.env.NODE_ENV !== "production") {
    allowedOrigins.push(
      "http://localhost:3000",
      /\.flossbank\.vercel\.app$/,
      /\.flossbank\.now\.sh$/
    );
    // redisConfig = config.getRedisLocalPC();
    // fastify.register(require("fastify-redis"), {
    //   port: redisConfig.port,
    //   host: redisConfig.host,
    // });
    fastify.register(require("fastify-redis"), {
      port: redisConfig.port,
      host: redisConfig.host,
      password: redisConfig.password,
      tls: {},
    });
  } else {
    fastify.register(require("fastify-redis"), {
      port: redisConfig.port,
      host: redisConfig.host,
      password: redisConfig.password,
      tls: {},
    });
  }
  fastify.setValidatorCompiler(({ schema, method, url, httpPart }) => {
    console.log(`Compiling AJV Schema for: ${url}`);
    return AJV.compile(schema);
  });
  fastify.setSerializerCompiler(function (schemaDefinition) {
    const { schema, method, url, httpStatus } = schemaDefinition;
    return function (data) {
      return JSON.stringify(data);
    };
  });
  fastify.register(require("fastify-cookie"), {
    secret: config.getJWTSecret(),
  });

  fastify.register(require("fastify-cors"), {
    origin: allowedOrigins,
    methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Requested-With"],
    credentials: true,
  });
  fastify.register(dbPlugin(db));
  fastify.register(routes, {
    axios,
    githubAPIWrapper,
    elastic,
    jwtService,
    config,
  });
  fastify.register(csrf);
  fastify.register(configPlugin(config));
  fastify.register(apolloServerPlugin);
  fastify.register(helmet);
  return fastify;
};
