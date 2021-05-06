const jwtService = require("../../helpers/jwt-service");
const createToken = (username, expiresIn) => {
  return jwtService.sign(
    { username },
    {
      expiresIn: expiresIn,
    }
  );
};
//addToSet and set cannot be the same operation
const Mutation = {
  Mutation: {
    signUp: async (
      root,
      { username, avatar, token, languagePreference, code, tokenRSS },
      { models: { User } }
    ) => {
      await User.findOneAndUpdate(
        { userName: username },
        {
          $set: {
            avatar: avatar,
            code: code,
            tokenRSS: tokenRSS,
            languagePreference: languagePreference,
            token: token,
          },
        },
        { upsert: true }
      );
      return {
        token: createToken(username, "6hr"),
      };
    },
  },
};

module.exports = Mutation;
