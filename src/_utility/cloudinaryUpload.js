require("dotenv").config();
const cloudinary = require("cloudinary").v2;

console.log(cloudinary.config().cloud_name);
// for each
cloudinary.uploader
    .upload("/FilmPhotos/020621_RB67_PORTRA400_06.jpg", { folder: node_upload })

