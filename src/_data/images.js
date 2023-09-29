require("dotenv").config();
var ImageKit = require("imagekit");
const path = require("path");
var fs = require("fs");

var imagekit = new ImageKit({
  publicKey: "public_ZqZCWkkX1UPuEfBGOjoH4H3XpXk=",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: "https://ik.imagekit.io/sidmiller",
  //authenticationEndpoint: "http://www.yourserver.com/auth",
});

var imagecachePath = "./src/_data/imagekitImages.json";
async function getImageData(limit = 500) {
  let data = imagekit
    .listFiles({ limit: limit })
    .then((result) => 
       filterMetadata(result)
    )
    .then((newResult) => {
      //writeCache(newResult, imagecachePath);
      return newResult;
    });
    return data;
}

async function filterMetadata(imageArray) {
  var json_data = [];
  var keywordList = new Set();
  var cameraList = new Set();
  var lensList = new Set();
  var filmList = new Set();
  var rollList = new Set();
  var nameList = new Set();

  for (var image of imageArray) {
    // Parse Camera, Film, and Lens from "Instructions" in EXIF
    var Instructions = image.embeddedMetadata.Instructions;
    if (Instructions) {
      var contextArray = Instructions.split(", ");
      var imageTags = contextArray.reduce((obj, data) => {
        let [k, v] = data.split("="); // split each pair into key/value
        obj[k] = v; // add the key to the object
        return obj;
      }, {});
    }

    /// Filter list of people in image
    var people = image.embeddedMetadata.PersonInImage;
    if (people != undefined) {
      // console.log(people)
      // var peopleList = people.split(", ");
      for (var name of people) {
        nameList.add(name);
      }
    } else {
      var peopleList = null;
    }

    ///filter items out of keywords
    var unfilteredKeywords = image.embeddedMetadata.Keywords;
    var toRemove = new Set(
      [].concat(imageTags.Camera, imageTags.Lens, imageTags.Film, people)
    );

    var filteredKeywords = [
      ...new Set(unfilteredKeywords.filter((x) => !toRemove.has(x))),
    ];

    //Album or Film Roll Name
    var albumName = path.basename(path.dirname(image.url));

    var imageObj = {
      file: image.fileId,
      imageSrc: image.url,
      urlSlug: image.filePath,
      altText: image.embeddedMetadata.Description,
      name: image.name,
      album: albumName,
      rating: image.embeddedMetadata.rating,
      tags: image.tags,
      keywords: filteredKeywords,
      width: image.width,
      height: image.height,
      people: people,
      camera: imageTags.Camera,
      lens: imageTags.Lens,
      film: imageTags.Film,
    };

    json_data.push(imageObj);
  }
  //console.log("json_data", json_data);
  return json_data;
}

function writeCache(data, path) {
  var dataString = JSON.stringify(data);
  fs.writeFile(path, dataString, (err) => {
    if (err) throw err;
    console.log(" -- Data written to file!", path);
  });
}
module.exports = async function() { 
  
  var imageData = await getImageData();
  //console.log("ImageData", imageData[0]);

  let output = {
    images: imageData,
    albums: [... new Set(imageData.map((x) => x.album).filter(x => x))],
    keywords: [...new Set(imageData.map((x) => x.keywords).flat().filter(x => x))],
    cameras: [...new Set(imageData.map((x) => x.camera).filter(x => x))],
    lenses: [...new Set(imageData.map((x) => x.lens).filter(x => x))],
    films: [...new Set(imageData.map((x) => x.film).filter(x => x))],
    people: [...new Set(imageData.map((x) => x.people).flat().filter(x => x))] //filter removes undefined values
  }
  
  console.log(output.albums)
  return output;
}