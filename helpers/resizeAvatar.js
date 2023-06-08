const Jimp = require("jimp");

async function resize(img) {
  try {
    const image = await Jimp.read(img);
    await image.resize(250, 250);
    await image.writeAsync(img);
  } catch (error) {
    console.log(error);
  }
}

module.exports = resize;
