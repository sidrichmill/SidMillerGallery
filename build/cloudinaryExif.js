//This should run once before building the site. It should get all the images and their metadata to be organized and used.

require("dotenv").config();
var cloudinary = require("cloudinary");
const path = require("path");
var fs = require("fs");

var imagecachePath = "./src/_data/cloudinaryImages.json";
var keywordcachePath = "./src/_data/cloudinaryTags.json";
var cameracachePath = "./src/_data/cloudinaryCameras.json";
var lenscachePath = "./src/_data/cloudinaryLenses.json";
var filmcachePath = "./src/_data/cloudinaryFilms.json";
var namecachePath = "./src/_data/cloudinaryNames.json";
var rollcachePath = "./src/_data/cloudinaryRolls.json";

var cloudinaryFolder = process.env.CLOUDINARY_SOURCE_FOLDER;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // add your cloud_name
  api_key: process.env.CLOUDINARY_API_KEY, // add your api_key
  api_secret: process.env.CLOUDINARY_API_SECRET, // add your api_secret
  secure: true,
});

async function getImages() {
  var json_data = [];
  var keywordList = new Set();
  var cameraList = new Set();
  var lensList = new Set();
  var filmList = new Set();
  var rollList = new Set();
  var nameList = new Set();

  var data = await cloudinary.v2.api.resources(
    {
      type: "upload",
      prefix: cloudinaryFolder, //your folder
      max_results: 1,
    },
    function (error, result) {
      if (error) {
        console.log("error in cloudinaryImages.js", error);
      }
    }
  );
  var images = data.resources;
  //console.log(images[0]);

  for (var imageSource of images) {

     let image = await cloudinary.v2.api.resource(imageSource.public_id, {image_metadata: true});
    // console.log("Image Metadata", image.image_metadata);
    ///

    
      var Instructions = image.image_metadata.Instructions;
      if (Instructions) {
        var contextArray = Instructions.split(", ");
        var imageTags = contextArray.reduce((obj,data)=> {
          let [k, v] = data.split('=')        // split each pair into key/value
          obj[k] = v                          // add the key to the object
          return obj
      }, {});
      }

  
      // if (contextArray) {
      //   var filteredContext = contextArray.filter((string) =>
      //     string.includes("=")
      //   );
      // } else {
      //   var filteredContext = [];
      // }
  
      


    ///
    
      var people = image.image_metadata.PersonInImage;
      if (people != null) {
        var peopleList = people.split(",");
        for (var name of peopleList) {
          nameList.add(name);
        }
      } else {
        var peopleList = null;
      }

    // create a set of keywords which does not include people, camera, lens, or film. These will be used to display tags on the page without duplicating the already specific tags
    var unfilteredKeywords = image.image_metadata.Keywords.split(", ");
    var toRemove = new Set([].concat(imageTags.Camera, imageTags.Lens, imageTags.Film, peopleList));

    var filteredKeywords = [
      ...new Set(unfilteredKeywords.filter((x) => !toRemove.has(x))),
    ];

    var albumName = path.basename(path.dirname(image.url));

    let filteredImageData = {
      file: image.public_id,
      imageSrc: image.url,
      urlSlug: "v" + image.version + "/" + image.public_id,
      altText: "Alt Text",
      name: path.basename(image.url),
      album: albumName,
      rating: image.rating,
      tags: image.tags,
      keywords: filteredKeywords,
      width: image.width,
      height: image.height,
      people: peopleList,
      camera: imageTags.Camera,
      lens: imageTags.Lens,
      film: imageTags.Film,
    }

    console.log("Filtered Image Data", filteredImageData);

    json_data.push(filteredImageData);

    for (var keyword of filteredKeywords) {
      keywordList.add(keyword);
    }
    if (imageTags.Camera) {
      cameraList.add(imageTags.Camera);
    }
    if (imageTags.Lens) {
      lensList.add(imageTags.Lens);
    }
    if (imageTags.Film) {
      filmList.add(imageTags.Film);
    }
    rollList.add(albumName);
  }

//   writeCache(json_data, imagecachePath);
//   writeCache([...keywordList], keywordcachePath);
//   writeCache([...rollList], rollcachePath);
//   writeCache([...nameList], namecachePath);
//   writeCache([...cameraList], cameracachePath);
//   writeCache([...lensList], lenscachePath);
//   writeCache([...filmList], filmcachePath);
}

function writeCache(data, path) {
  var dataString = JSON.stringify(data);
  fs.writeFile(path, dataString, (err) => {
    if (err) throw err;
    console.log(" -- Data written to file!", path);
  });
}

getImages();

//example output:

// "file": "archive/201225_Graflex_HP5_400/201225_Graflex_HP5_400_01",
// "imageSrc": "http://res.cloudinary.com/sid-miller-design/image/upload/v1652289956/archive/201225_Graflex_HP5_400/201225_Graflex_HP5_400_01.jpg",
// "urlSlug": "v1652289956/archive/201225_Graflex_HP5_400/201225_Graflex_HP5_400_01",
// "name": "201225_Graflex_HP5_400_01.jpg",
// "album": "201225_Graflex_HP5_400",
// "tags": [
//     "Devon Willard",
//     "Graflex Crown Graphic",
//     "Ilford HP5+ 400",
//     "Kodak Ektar 127mm f4.7",
//     "portrait"
// ],
// "keywords": [
//     "portrait"
// ],
// "width": 2506,
// "height": 3000,
// "people": [
//     "Devon Willard"
// ],
// "camera": "Graflex Crown Graphic",
// "lens": "Kodak Ektar 127mm f4.7",
// "film": "Ilford HP5+ 400"

//   


async function getFilteredData(image) {

      //get image metadata filtered for keywords. Output is an array of keywords
      let exifData = image.image_metadata;

    //   var caption = exifData.ImageDescription || "";
    //   var color = exifData.ConvertToGrayscale ? "black and white" : "color";
      var keywordsArray = exifData.Keywords;
      var Instructions = exifData.Instructions;
      if (Instructions) {
        var contextArray = Instructions.split(", ");
      }
  
      if (contextArray) {
        var filteredContext = contextArray.filter((string) =>
          string.includes("=")
        );
      } else {
        var filteredContext = [];
      }
  
      var people = exifData.PersonInImage;
      console.log("People", people);
      if (people) {
        var peoplestring = "people=" + people;
        filteredContext.push(peoplestring);
      }
      var imageMeta = filteredContext.join("|");
      // build object for image with relevent data for Cloudinary
      var imageData = {
        name: fileName,
        folderName: dir.dirName,
        imageSrc: imageSrc,
        tags: keywordsArray,
        metadata: imageMeta,
      };
      console.log(imageData);
      return imageData;
    }