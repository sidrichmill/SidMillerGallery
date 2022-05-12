//this file runs a JS function getImages which recieves all of the images in the cloudinary folder labeled "film"
// It returns an array of all the images with their public id, url, and a list of keywords

require("dotenv").config();
var cloudinary = require("cloudinary");
const path = require("path");
var fs = require("fs");

var imagecachePath = "./src/_data/cloudinaryImages.json";
var keywordcachePath = "./src/_data/cloudinarykeywords.json";
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
      tags: true,
      context: true,
      metadata: true,
      max_results: 500,
    },
    function (error, result) {
      if (error) {
        console.log("error in cloudinaryImages.js", error);
      }
    }
  );
  var images = data.resources;
  //console.log(images[0]);

  for (var image of images) {
    //console.log(image);

    if (image.context) {
      var camera = image.context.custom.Camera;
      var lens = image.context.custom.Lens;
      var film = image.context.custom.Film;
      var people = image.context.custom.people;
      if (people != null) {
        var peopleList = people.split(",");
        for (var name of peopleList) {
          nameList.add(name);
        }
      } else {
        var peopleList = null;
      }
    } else {
      var camera = null;
      var film = null;
    }

    // create a set of keywords which does not include people, camera, lens, or film. These will be used to display tags on the page without duplicating the already specific tags
    var unfilteredKeywords = image.tags;
    var toRemove = new Set([].concat(camera, lens, film, peopleList));

    var filteredKeywords = [
      ...new Set(unfilteredKeywords.filter((x) => !toRemove.has(x))),
    ];

    var albumName = path.basename(path.dirname(image.url));
    if (image.context != undefined) {
      var altTextData = image.context.custom.alt;
    } else {
      var altTextData = "placeholder alt text";
    }

    json_data.push({
      file: image.public_id,
      imageSrc: image.url,
      urlSlug: "v" + image.version + "/" + image.public_id,
      altText: altTextData,
      name: path.basename(image.url),
      album: albumName,
      rating: image.rating,
      tags: image.tags,
      keywords: filteredKeywords,
      width: image.width,
      height: image.height,
      people: peopleList,
      camera: camera,
      lens: lens,
      film: film,
    });

    for (var keyword of filteredKeywords) {
      keywordList.add(keyword);
    }
    if (camera) {
      cameraList.add(camera);
    }
    if (lens) {
      lensList.add(lens);
    }
    if (film) {
      filmList.add(film);
    }
    rollList.add(albumName);
  }

  writeCache(json_data, imagecachePath);
  writeCache([...keywordList], keywordcachePath);
  writeCache([...rollList], rollcachePath);
  writeCache([...nameList], namecachePath);
  writeCache([...cameraList], cameracachePath);
  writeCache([...lensList], lenscachePath);
  writeCache([...filmList], filmcachePath);
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

// {
//     file: 'film/210906_645E_PORTRA_400/210906_645E_PORTRA400_12',
//     imageSrc: 'http://res.cloudinary.com/sid-miller-design/image/upload/v1631220381/film/210906_645E_PORTRA_400/210906_645E_PORTRA400_12.jpg',
//     album: '210906_645E_PORTRA_400',
//     keywords: [
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
