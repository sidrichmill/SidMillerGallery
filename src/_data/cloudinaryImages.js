//this file runs a JS function getImages which recieves all of the images in the cloudinary folder labeled "film"
// It returns an array of all the images with their public id, url, and a list of tags

require("dotenv").config();
var cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // add your cloud_name
    api_key: process.env.CLOUDINARY_API_KEY, // add your api_key
    api_secret: process.env.CLOUDINARY_API_SECRET, // add your api_secret
    secure: true
});

async function getImages() {
    var json_data = [];
    var data = await cloudinary.v2.api.resources({
        type: 'upload',
        prefix: 'film', //your folder
        tags: true,
        context: true,
        metadata: true,
        max_results: 10
    },
        function (error, result) {
            if (error) { console.log("error in cloudinaryImages.js", error) }
        });
    var images = data.resources;

    for (image of images) {
        if(image.context != undefined){var altTextData = image.context.custom.alt}else{var altTextData = "placeholder alt text"};
        json_data.push(
            {
                file: image.public_id,
                imageSrc: image.url,
                tags: image.tags,
                width: image.width,
                height: image.height,
                urlSlug: "v" + image.version + "/" + image.public_id,
                altText: altTextData
            }
        );
    }
    //console.log(json_data);
    return json_data;
};

module.exports = getImages();