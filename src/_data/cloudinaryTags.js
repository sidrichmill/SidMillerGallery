//this file runs a JS function getTags() which returns all of the image tags which exist in my cloudinary account
require("dotenv").config();
var cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // add your cloud_name
    api_key: process.env.CLOUDINARY_API_KEY, // add your api_key
    api_secret: process.env.CLOUDINARY_API_SECRET, // add your api_secret
    secure: true
});


async function getTags() {
    //
    var data = await cloudinary.v2.api.tags({
        max_results: 500
    },
        function (error, result) { if (error) { console.log("error in cloudinaryTags.js", error) } });
    //

    return data.tags;
};

module.exports = getTags();