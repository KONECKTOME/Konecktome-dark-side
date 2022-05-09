const usersModel = require("../../Customers/Profiles/schema");

var cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploads = (file) => {
  return cloudinary.uploader.upload(file, function (error, result) {});
};

module.exports = { uploads };
