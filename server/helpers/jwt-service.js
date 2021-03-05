const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");

// use 'utf8' to get string instead of byte array  (512 bit key)
const PRIV_KEY = fs.readFileSync(
  path.join(__dirname, "..", "private"),
  "utf-8"
);
const PUB_KEY = fs.readFileSync(
  path.join(__dirname, "..", "public.pub"),
  "utf-8"
);
//TO generate public and private key, use https://www.csfieldguide.org.nz/en/interactives/rsa-key-generator/
module.exports = {
  sign: (payload, options) => {
    const signOptions = {
      expiresIn: options.expiresIn, // 30 days validity
      algorithm: "RS256",
    };
    return jwt.sign(payload, PRIV_KEY, signOptions);
  },
  verify: (token) => {
    const verifyOptions = {
      algorithm: ["RS256"],
    };
    try {
      return jwt.verify(token, PUB_KEY, verifyOptions);
    } catch (err) {
      if (
        err.name === "TokenExpiredError" ||
        err.name === "JsonWebTokenError"
      ) {
        throw new Error(err.name);
      }
    }
  },
  decode: (token) => {
    return jwt.decode(token, { complete: true });
    //returns null if token is invalid
  },
};
