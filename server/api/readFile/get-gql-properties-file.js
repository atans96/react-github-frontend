const fs = require("fs");
const path = require("path");
module.exports = async (req, res, ctx, ...args) => {
  try {
    fs.readFile(
      path.resolve(__dirname, "../..") + "/propertiesGQLData.txt",
      "utf8",
      function read(err, data) {
        if (err) {
          throw err;
        }
        const content = data.replace(/\n/g, ",").split(",");
        res.send({ data: content }); // Put all of the code here (not the best solution)
      }
    );
  } catch (e) {
    ctx.log.error(e);
  }
};
