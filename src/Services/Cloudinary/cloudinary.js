const usersModel = require("../../Customers/Profiles/schema");

var cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "konecktome",
  api_key: "375224759795671",
  api_secret: "c2npqYhvQSQ5Y62yE2f5lKuV4lU",
});

const uploads = (file) => {
  return cloudinary.uploader.upload(file, function (error, result) {});
};

module.exports = { uploads };
