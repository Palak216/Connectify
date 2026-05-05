// const cloudinary = require("cloudinary").v2;

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// module.exports = cloudinary;

const cloudinary = require("cloudinary").v2;
require("dotenv").config();

try {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
    });
} catch(error) {
    console.log("Error occur while connecting to Cloudinary");
    console.log(error);
}

module.exports = cloudinary;