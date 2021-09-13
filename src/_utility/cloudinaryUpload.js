require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const fs = require('fs');
var exifr = require('exifr');
var path = require('path');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // add your cloud_name
    api_key: process.env.CLOUDINARY_API_KEY, // add your api_key
    api_secret: process.env.CLOUDINARY_API_SECRET, // add your api_secret
    secure: true
});

// top level image folder "WebImages"
// drop new folder of images (one folder per roll of film) into top level folder
// fs gets folder name - creates new folder on cloudinary
// fs gets list of images
// {
//     dirName: "210906_645E_PORTRA_400",
//     dirPath: "./image_upload/210906_645E_PORTRA_400",
//     files: [
//         '210906_645E_PORTRA400_01.jpg',
//         '210906_645E_PORTRA400_02.jpg',
//         '210906_645E_PORTRA400_03.jpg',
//         '210906_645E_PORTRA400_04.jpg',
//         '210906_645E_PORTRA400_05.jpg',
//         '210906_645E_PORTRA400_06.jpg',
//         '210906_645E_PORTRA400_07.jpg',
//         '210906_645E_PORTRA400_08.jpg',
//         '210906_645E_PORTRA400_09.jpg',
//         '210906_645E_PORTRA400_10.jpg',
//         '210906_645E_PORTRA400_11.jpg',
//         '210906_645E_PORTRA400_12.jpg',
//         '210906_645E_PORTRA400_13.jpg',
//         '210906_645E_PORTRA400_14.jpg',
//         '210906_645E_PORTRA400_15.jpg'
//     ]
// }
// for each image in folder:
    //get exif keywords, camera info
    //translate them into tags / metadata for cloudinary
    //upload image with all relevent metadata

    //makeImageMd generates a markdown file with front matter tags from image files
var directory = [];
var imageDataList = [];

function getImageDirSync(baseDir){
    var dirList = fs.readdirSync(baseDir, {withFileTypes:true});
    
    for(file of dirList){
        file["path"] = baseDir + "/" + file.name;
        var imageList = fs.readdirSync(file.path);
       
        const folderObj = {
            dirName: file.name,
            dirPath: file.path,
            files: imageList
        };

        directory.push(folderObj);
    }
     
};

async function getSubdir(baseDir){

    for(subdir of baseDir){
        if(subdir.files.length === 0){
            console.log("Directory:", subdir.dirName, "contains no files");
        } else if (checkforExistingFolder(subdir.dirName)){
            console.log("Directory:", subdir.dirName, "already exists on Cloudinary")
        } else {
            getImageData(subdir);
        }
    }
};

async function getImageData(dir){
    //get file name without file extension

    for (var image of dir.files){
        var fileName = image;
        var imageSrc = dir.dirPath + '/' + image;
        //console.log("Image Source", imageSrc);

        //get image metadata filtered for keywords. Output is an array of keywords
        var exifData = await exifr.parse(imageSrc, { iptc: true, xmp: true });
        //console.log(exifData);
        var caption = exifData.ImageDescription || "DEFAULT";
        var color = (exifData.ConvertToGrayscale ? "Black and White" : "Color");
        //console.log(image, color);
        var details = caption.split(", ");
        //add default keywords to list
        //var tags = exifData.Keywords;
        details.push(color);
        details.push("film");
        var camera = exifData.Make + " " + exifData.Model;
        // get film stock from 3rd position of keywords [Camera, Lens, Film Stock]
        var stock = details[2] || "NA";

        // build object for image with relevent data for Cloudinary
        var imageData = {
            'name': fileName,
            'folderName': dir.dirName,
            'imageSrc': imageSrc,
            'tags': details,
            'metadata': {
                'camera': camera,
                'filmStock': stock,
                'color': color
            }
        }
        //console.log(imageData);
        //imageDataList.push(imageData);
        uploadImage(imageData);
    }
    //console.log(imageDataList[0]);
    //uploadImage(imageDataList[0])
};
async function checkforExistingFolder(folderName){
    var cloudinaryFolders = await cloudinary.api.sub_folders('film', {max_results: 500}, (error, result) => {
        if(error){console.error("Error on check cloudinary folders", error);}
        //console.log ("Existing Folders on Cloudinary", result)
        return result;
    });
    //console.log("cloudinaryFolders", cloudinaryFolders);
    var filteredArray = cloudinaryFolders.folders.filter(e => e.name === folderName)
    var exists = filteredArray.length > 0;
    //console.log("folder exists", exists)
    return exists;
}

function uploadImage(imageData){
    var imageOptions = { 
        folder: "film/" + imageData.folderName, 
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        tags: imageData.tags,
        context: imageData.metadata
    };

 
  //  { folder: imageData.folderName, use_filename: true, unique_filename: false, overwrite: true, tags: imageData.tags, context: imageData.metadata }
   cloudinary.uploader.upload(imageData.imageSrc, imageOptions, function(error, result){console.log(result, error);});

};

getImageDirSync('./image_upload');
getSubdir(directory);


