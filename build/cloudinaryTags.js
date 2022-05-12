//this file runs a JS function getTags() which returns all of the image tags which exist in my cloudinary account
require("dotenv").config();
var cloudinary = require("cloudinary");
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // add your cloud_name
  api_key: process.env.CLOUDINARY_API_KEY, // add your api_key
  api_secret: process.env.CLOUDINARY_API_SECRET, // add your api_secret
  secure: true,
});

async function getTags() {
  //
  var data = await cloudinary.v2.api.tags(
    {
      max_results: 500,
    },
    function (error, result) {
      if (error) {
        console.log("error in cloudinaryTags.js", error);
      }
    }
  );
  //
  //console.log(data.tags);
  // return data.tags;

  var dataString = JSON.stringify(data.tags);
  fs.writeFile(cachePath, dataString, (err) => {
    if (err) throw err;
    console.log(" -- Data written to file!", cachePath);
  });
}

getTags();
//module.exports = getTags();
