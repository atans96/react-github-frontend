const { defaultFieldResolver } = require("graphql");
const { DirectiveLocation } = require("graphql");
const { GraphQLDirective } = require("graphql");
const { SchemaDirectiveVisitor } = require("graphql-tools");

class AuthError extends Error {
  constructor(message = "Unauthorized", code = 401) {
    super(message);
    this.code = code;
  }
}
const authenticate = ({ username, exp }) => {
  if (!username) {
    return null;
  } else if (username && !exp > 0) {
    throw new AuthError(); //will be thrown the message on client\index.tsx
  }
};
class AuthDirective extends SchemaDirectiveVisitor {
  static getDirectiveDeclaration(directiveName = "auth") {
    return new GraphQLDirective({
      name: directiveName,
      locations: [DirectiveLocation.FIELD_DEFINITION],
    });
  }

  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;

    field.resolve = (root, args, context, info) => {
      authenticate(context.currentUser);
      return resolve.call(this, root, args, context, info);
    };
  }
}
module.exports = AuthDirective;
