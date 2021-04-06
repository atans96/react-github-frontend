const fastifyPlugin = require("fastify-plugin");
const jwtService = require("../../helpers/jwt-service");
const { ApolloServer } = require("apollo-server-fastify");
const resolvers = require("../../Resolvers");
const typeDefs = require("../../Schema");
const models = require("../../models");
const {
  GraphQLInt,
  DirectiveLocation,
  GraphQLScalarType,
  GraphQLDirective,
  GraphQLList,
} = require("graphql");
const { SchemaDirectiveVisitor } = require("graphql-tools");

class LengthDirective extends SchemaDirectiveVisitor {
  visitInputFieldDefinition(field) {
    this.wrapType(field);
  }

  visitFieldDefinition(field) {
    this.wrapType(field);
  }
  static getDirectiveDeclaration(directiveName) {
    return new GraphQLDirective({
      name: directiveName,
      locations: [DirectiveLocation.FIELD_DEFINITION],
      args: {
        max: { type: GraphQLInt },
      },
    });
  }
  // Replace field.type with a custom GraphQLScalarType that enforces the
  // length restriction.
  wrapType(field) {
    const fieldName = field.astNode.name.value;
    const { type } = field;
    if (field.type instanceof GraphQLList) {
      field.type = new LimitedLengthType(fieldName, type, this.args.max);
    } else {
      throw new Error(`Not a scalar type: ${field.type}`);
    }
  }
}

class LimitedLengthType extends GraphQLScalarType {
  constructor(type, maxLength) {
    super({
      name: `LengthAtMost${maxLength}`,

      // For more information about GraphQLScalar type (de)serialization,
      // see the graphql-js implementation:
      // https://github.com/graphql/graphql-js/blob/31ae8a8e8312/src/type/definition.js#L425-L446

      serialize(value) {
        value = type.serialize(value);
        if (value.length <= maxLength) {
          return value;
        }
        return value.slice(-maxLength);
      },

      parseValue(value) {
        return type.parseValue(value);
      },

      parseLiteral(ast) {
        return type.parseLiteral(ast);
      },
    });
  }
}
const apolloServerPlugin = fastifyPlugin(async (fastify, opts, next) => {
  const corsOptions = {
    origin: `http://localhost:${process.env.CLIENT_PORT || 3000}`,
    credentials: true,
  };
  const server = new ApolloServer({
    typeDefs, //schema will map Mongoose to GraphQL
    resolvers,
    schemaDirectives: {
      length: LengthDirective,
    },
    //The context argument is useful for passing things that any resolver might need,
    // like authentication scope, database connections, and custom fetch functions
    // in this case we pass the Mongo Schema to the resolver so that it can insert from resolver in resolvers\Mutation\Mutation.js
    // to Mongo Schema and will be used to query in resolvers\Query\Query.js
    context: ({ request }) => ({
      models,
      currentUser: request?.currentUser,
    }),
  });

  fastify.addHook("preHandler", async (request, reply) => {
    const token = request.headers["authorization"];
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
              request.query.username
            }&isLoggedIn=${true}`
          );
          if (res.valid) {
            request.currentUser = res;
          }
        }
        reply.send(err);
      }
    }
  });

  fastify.register(server.createHandler({ cors: corsOptions }));

  next();
});
module.exports = { apolloServerPlugin };
