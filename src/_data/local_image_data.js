const fs = require("fs");
var exifr = require("exifr");
const path = require("path");
const sizeOf = require("image-size");
const { getAverageColor } = require("fast-average-color-node");

let allImagesData = [];

function getImageDirSync(baseDir) {
  var directory = [];
  var dirList = fs.readdirSync(baseDir, { withFileTypes: true });

  for (file of dirList) {
    file["path"] = baseDir + "/" + file.name;
    var imageList = fs.readdirSync(file.path);

    const folderObj = {
      dirName: file.name,
      dirPath: file.path,
      files: imageList,
    };
    //console.log(folderObj);
    directory.push(folderObj);
  }
  getSubdir(directory);
}

async function getSubdir(baseDir) {
  for (subdir of baseDir) {
    getImageData(subdir);
  }
}

async function getImageData(dir) {
  console.log(dir.files.length);
  for (var image of dir.files) {
    var fileName = image;
    var imageSrc = dir.dirPath + "/" + image;
    // console.log(image);
    var dimensions = await sizeOf(imageSrc);
    // console.log("dimension", dimensions);
    //get image metadata filtered for keywords. Output is an array of keywords
    var exifData = await exifr
      .parse(imageSrc, { iptc: true, xmp: true })
      .catch(console.error);
    // console.log("exifData.ImageWidth", exifData.ImageWidth);

    var keywordsArray = exifData.Keywords;

    if (exifData.Instructions) {
      var analogMetadata = {};

      exifData.Instructions.split(", ").forEach((e) => {
        let split = e.split("=");
        analogMetadata[split[0].trim().toLowerCase()] = split[1].trim();
      });
      // console.log(
      //   "🚀 ~ file: local_image_data.js ~ line 39 ~ getImageData ~ analogMetadata",
      //   analogMetadata
      // );
    }

    let peopleArray =
      typeof exifData.PersonInImage == "object"
        ? exifData.PersonInImage
        : typeof exifData.PersonInImage == "string"
        ? [exifData.PersonInImage]
        : exifData.PersonInImage;

    var toRemove = new Set(
      [].concat(
        analogMetadata.camera,
        analogMetadata.lens,
        analogMetadata.film,
        peopleArray
      )
    );

    var filteredKeywords = [
      ...new Set(keywordsArray.filter((x) => !toRemove.has(x))),
    ];

    let colorObject = await getAverageColor(imageSrc).catch(console.error);
    // console.log(imageSrc, colorObject);

    // build object for image with relevent data for ifCloudinary
    var imageData = {
      file: fileName,
      imageSrc: imageSrc,
      altText: exifData.Caption,
      name: path.basename(imageSrc, path.extname(imageSrc)),
      path: imageSrc,
      album: dir.dirName,
      rating: exifData.Rating || 0,
      tags: exifData.Keywords,
      keywords: filteredKeywords,
      width: dimensions.width,
      height: dimensions.height,
      color: colorObject.hex,
      colorisDark: colorObject.isDark,
      people: peopleArray,
      camera: analogMetadata.camera,
      lens: analogMetadata.lens,
      film: analogMetadata.film,
    };

    allImagesData.push(imageData);
    // console.log(imageData);
    //imageDataList.push(imageData);
    //   uploadImage(imageData);
  }

  // return allImagesData;
}

//getImageDirSync("D:/Programming/SidMillerGallery/imageTest");

module.exports = async function () {
  await getImageDirSync("./image_upload");
  console.log(allImagesData[0]);
  return allImagesData;
};
