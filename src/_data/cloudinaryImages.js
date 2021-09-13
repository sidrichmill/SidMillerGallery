//this file runs a JS function getImages which recieves all of the images in the cloudinary folder labeled "film"
// It returns an array of all the images with their public id, url, and a list of tags

require("dotenv").config();
var cloudinary = require('cloudinary');
const path = require("path");

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
        max_results: 500
    },
        function (error, result) {
            if (error) { console.log("error in cloudinaryImages.js", error) }
        });
    var images = data.resources;
        
    for (image of images) {
        //console.log(image);
        if(image.context){
            var camera = image.context.custom.camera;
            var filmStock = image.context.custom.filmStock;
        } else {
            var camera = null;
            var filmStock = null;
        }
        if(image.context != undefined){var altTextData = image.context.custom.alt}else{var altTextData = "placeholder alt text"};
        json_data.push(
            {
                file: image.public_id,
                imageSrc: image.url,
                urlSlug: "v" + image.version + "/" + image.public_id,
                altText: altTextData,
                name: path.basename(image.url),
                album: path.basename(path.dirname(image.url)),
                rating: image.rating,
                tags: image.tags,
                width: image.width,
                height: image.height,
                camera: camera,
                filmStock: filmStock
            }
        );
    }
    console.log(json_data[0]);
    return json_data;
};

// async function printData(){
// var data = await getImages();
// console.log(data);
// }

// printData();

module.exports = getImages();

//example output:

// {
//     file: 'film/210906_645E_PORTRA_400/210906_645E_PORTRA400_12',
//     imageSrc: 'http://res.cloudinary.com/sid-miller-design/image/upload/v1631220381/film/210906_645E_PORTRA_400/210906_645E_PORTRA400_12.jpg',
//     album: '210906_645E_PORTRA_400',
//     tags: [
//       'Color',
//       'film',
//       'Kodak Portra 400',
//       'Mamiya 645E',
//       'Mamiya 80mm f2.8'
//     ],
//     width: 2201,
//     height: 3000,
//     camera: 'Mamiya 645E',
//     filmStock: 'Kodak Portra 400',
//     urlSlug: 'v1631220381/film/210906_645E_PORTRA_400/210906_645E_PORTRA400_12',
//     altText: undefined
//   },