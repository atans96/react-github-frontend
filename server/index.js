require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const cors_proxy = require("cors-anywhere");

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
