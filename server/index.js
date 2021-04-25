require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const App = require("./app");
const { Config } = require("./decorators/config");
const cors_proxy = require("cors-anywhere");
const axios = require("axios");
const { Db } = require("./decorators/db");
const jwtService = require("./helpers/jwt-service");
const githubAPIWrapper = require("./GithubAPIWrapper/index");
axios.defaults.withCredentials = true;
const CancelToken = axios.CancelToken;
let cancel;
axios.interceptors.request.use(
  (req) => {
    if (!!req.query?.cancelToken) {
      cancel(); // cancel request
    }
    if (req.query?.cancelToken !== undefined) {
      req.cancelToken = new CancelToken(function executor(c) {
        cancel = c;
      });
    }

    return req;
  },
  function (error) {
    return Promise.reject(error);
  }
);
mongoose
  .connect(process.env.DATABASE, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });
cors_proxy
  .createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ["origin", "x-requested-with"],
    removeHeaders: ["cookie", "cookie2"],
  })
  .listen(process.env.CORS_ANYWHERE_PORT || 8080, "localhost", function () {
    console.log(
      "Running CORS Anywhere on " +
        "localhost" +
        ":" +
        process.env.CORS_ANYWHERE_PORT || 8080
    );
  });
(async function () {
  const config = new Config({ env: process.env });
  const db = new Db({ config });
  await db.setup();
  const app = await App({
    config,
    axios,
    db,
    jwtService,
    githubAPIWrapper,
  });
  try {
    await app.listen(config.getServerPort() || 5000);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
