//this file runs a JS function getTags() which returns all of the image tags which exist in my cloudinary account
require("dotenv").config();
var cloudinary = require('cloudinary');
const path = require("path");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // add your cloud_name
    api_key: process.env.CLOUDINARY_API_KEY, // add your api_key
    api_secret: process.env.CLOUDINARY_API_SECRET, // add your api_secret
    secure: true
});


async function getFolders() {
    //get all subfolders inside of the film folder
    var data = await cloudinary.v2.api.sub_folders("film", {
        max_results: 500
    },
        function (error, result) { if (error) { console.log("error in cloudinaryTags.js", error) } });
    //

    for(var folder of data.folders){
       var contents = await getContents(folder.path);
        folder.files = contents;
    };
    //console.log(data);
    return data.folders;
};

async function getContents(folderPath){
    var data = await cloudinary.v2.api.resources({
        type: 'upload',
        prefix: folderPath, //your folder
        tags: true,
        context: true,
        metadata: true,
        max_results: 500
    }, function (error, result) {
        if (error) { console.log("error in cloudinaryImages.js", error) }
    });

    var imageData = [];
    
    var images = data.resources;
        
    for (image of images) {
        //console.log(image);
        if(image.context){
            var camera = image.context.custom.camera;
            var filmStock = image.context.custom.filmStock;
            var altTextData = image.context.custom.alt
        } else {
            var camera = null;
            var filmStock = null;
            var altTextData = "placeholder alt text"
        };

        imageData.push(
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
    //console.log(imageData);
    return imageData; //an array of objects representing each image in the folder
};

module.exports = getFolders();

//Sample output:

// [
//     {
//       name: '210906_645E_PORTRA_400',
//       path: 'film/210906_645E_PORTRA_400'
//     }
//   ]