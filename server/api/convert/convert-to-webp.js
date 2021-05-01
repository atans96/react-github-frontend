const sharp = require("sharp");
module.exports = async (req, res, ctx, ...args) => {
  try {
    const imageResponse = await args[0].axios({
      method: "get",
      url: req.query.imgUrl,
      responseType: "arraybuffer",
    });
    const data = Buffer.from(imageResponse.data, "binary");
    const webp = await sharp(data)
      .webp({ quality: 50, lossless: true })
      .toBuffer();
    res.send({ original: webp.toString("base64") });
  } catch (e) {
    console.log(e);
    res.send({ original: "" });
  }
};
