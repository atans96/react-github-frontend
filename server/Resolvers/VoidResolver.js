const { GraphQLScalarType } = require("graphql");
const VoidResolver = {
  Void: new GraphQLScalarType({
    name: "Void",
    description: "Represents NULL values",
    parseValue() {
      return null;
    },
    serialize() {
      return null;
    },
    parseLiteral() {
      return null;
    },
  }),
};
module.exports = VoidResolver;
