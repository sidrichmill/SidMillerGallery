//this file runs a JS function getImages which recieves all of the images in the cloudinary folder labeled "film"
// It returns an array of all the images with their public id, url, and a list of tags

var cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: "sid-miller-design", // add your cloud_name
    api_key: "515183593355286", // add your api_key
    api_secret: "iVwkTdMBy36Cq73KNcJfjy4dkSw", // add your api_secret
    secure: true
});

async function getImages() {
    var json_data = [];
    var data = await cloudinary.v2.api.resources({
        type: 'upload',
        prefix: 'film', //your folder
        tags: true,
        max_results: 500
    },
        function (error, result) {
            if (error) { console.log("error in cloudinaryImages.js", error) }
        });
    var images = data.resources;

    for (image of images) {
        json_data.push(
            {
                file: image.public_id,
                imageSrc: image.url,
                tags: image.tags,
                width: image.width,
                height: image.height,
                urlSlug: "v" + image.version + "/" + image.public_id
            }
        );
    }
    //console.log(json_data);
    return json_data;
};

module.exports = getImages();