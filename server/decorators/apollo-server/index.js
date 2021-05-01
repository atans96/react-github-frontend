const fastifyPlugin = require("fastify-plugin");
const jwtService = require("../../helpers/jwt-service");
const { ApolloServer } = require("apollo-server-fastify");
const resolvers = require("../../Resolvers");
const typeDefs = require("../../Schema");
const models = require("../../models");
const directives = require("./directives");
const apolloServerPlugin = (eventEmitter) =>
  fastifyPlugin(async (fastify, opts, next) => {
    const corsOptions = {
      origin: `http://localhost:${process.env.CLIENT_PORT || 3000}`,
      credentials: true,
    };
    const server = new ApolloServer({
      typeDefs, //schema will map Mongoose to GraphQL
      resolvers,
      schemaDirectives: {
        length: directives.LengthDirective,
        auth: directives.AuthDirective,
      },
      //The context argument is useful for passing things that any resolver might need,
      // like authentication scope, database connections, and custom fetch functions
      // in this case we pass the Mongo Schema to the resolver so that it can insert from resolver in resolvers\Mutation\Mutation.js
      // to Mongo Schema and will be used to query in resolvers\Query\Query.js
      context: ({ request }) => ({
        models,
        eventEmitter,
        currentUser: request?.currentUser,
      }),
    });

    fastify.addHook("preHandler", async (request, reply) => {
      const token = request.headers["authorization"]; //this comes from client\index.tsx on setContext
      if (
        token !== "null" &&
        token !== "undefined" &&
        typeof token !== "undefined"
      ) {
        try {
          const currentUser = await jwtService.verify(token);
          if (currentUser.exp > 0) {
            request.currentUser = currentUser;
          }
        } catch (err) {
          if (err.message === "TokenExpiredError") {
            const res = await fastify.inject(
              `/api/verifyJWTToken?token=${token}&username=${
                request.query.username //this query.username comes from client\index.tsx on setContext
              }&isLoggedIn=${true}`
            );
            if (res.valid) {
              request.currentUser = res;
            } else {
              reply.send(err);
            }
          } else {
            reply.send(err);
          }
        }
      }
    });

    fastify.register(server.createHandler({ cors: corsOptions }));

    next();
  });
module.exports = { apolloServerPlugin };
