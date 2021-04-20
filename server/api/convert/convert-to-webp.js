const sharp = require("sharp");
const { encode } = require("blurhash");
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
    const { data: pixels, info: metadata } = await sharp(data)
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });
    const blurHash = encode(
      new Uint8ClampedArray(pixels),
      metadata.width,
      metadata.height,
      4,
      4
    );
    res.send({ original: webp.toString("base64"), blurHash });
  } catch (e) {
    res.send({ original: "", blurHash: "" });
  }
};
