const { v2: cloudinary } = require('cloudinary');
const { Readable } = require('stream');
const dotenv = require("dotenv")
dotenv.config()
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "CMS" },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

module.exports = { cloudinary, uploadToCloudinary };