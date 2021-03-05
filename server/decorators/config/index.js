const fastifyPlugin = require("fastify-plugin");

class Config {
  constructor({ env }) {
    this.env = env;
  }
  getJWTSecret() {
    return this.env.JWT_SECRET;
  }
  getMongoURI() {
    return this.env.DATABASE;
  }
  getServerPort() {
    return this.env.SERVER_PORT;
  }
  getLambdaStoreRedis() {
    const result = {
      port: this.env.REDIS_LAMBDA_STORE_PORT,
      host: this.env.REDIS_LAMBDA_STORE_ENDPOINT,
      password: this.env.REDIS_LAMBDA_STORE_PASSWORD,
    };
    return result;
  }
  getRedisLocalPC() {
    const result = {
      port: this.env.REDIS_LOCAL_PORT,
      host: this.env.REDIS_LOCAL_ENDPOINT,
    };
    return result;
  }
}

const configPlugin = (config) =>
  fastifyPlugin(async (fastify) => {
    fastify.decorate("config", config);
  });

module.exports = { Config, configPlugin };
