const { GraphQLDirective } = require("graphql");
const { SchemaDirectiveVisitor } = require("graphql-tools");
const { GraphQLInt } = require("graphql");
const { DirectiveLocation } = require("graphql");
const { GraphQLList } = require("graphql");
const { GraphQLScalarType } = require("graphql");

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
    const { type } = field;
    if (field.type instanceof GraphQLList) {
      field.type = new LimitedLengthType(type, this.args.max);
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
        if (value.length <= maxLength) {
          return value;
        }
        return _.takeRight(value, maxLength);
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
module.exports = LengthDirective;
