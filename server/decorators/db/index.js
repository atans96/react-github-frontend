const fastifyPlugin = require("fastify-plugin");
const { MongoClient, ObjectId } = require("mongodb");

const UserDb = require("./user");
const models = require("../../models");

class Db {
  constructor({ config }) {
    const url = config.getMongoURI();
    if (!url) throw new Error("no mongo uri in environment");
    this.mongoClient = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  async setup() {
    this.client = await this.mongoClient.connect();
    this.db = this.client.db("github");

    this.user = new UserDb({ db: this.db, models });
  }
}

exports.Db = Db;

exports.dbPlugin = (db) =>
  fastifyPlugin(async (fastify) => {
    fastify.decorate("db", db);
    fastify.decorate("ObjectId", ObjectId);
  });
