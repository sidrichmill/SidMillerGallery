//this file runs a JS function getTags() which returns all of the image tags which exist in my cloudinary account

var cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: "sid-miller-design", // add your cloud_name
    api_key: "515183593355286", // add your api_key
    api_secret: "iVwkTdMBy36Cq73KNcJfjy4dkSw", // add your api_secret
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