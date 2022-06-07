const exifr = require("exifr");
const path = require("path");
const { getAverageColor } = require("fast-average-color-node");
const { promisify } = require("util");
const sizeOf = promisify(require("image-size"));

//console.log("ImageDirectories", imageDirectories());

module.getMeta = async function (filePath) {
  let fileName = path.basename(filePath);
  // console.log(image);
  // var dimensions = await sizeOf(imageSrc);

  //let imageBuffer = fs.readFileSync(filePath);
  let dimensions = await sizeOf(filePath).catch((e) =>
    console.error(fileName, e)
  );

  //console.log("dimension", fileName, dimensions);
  //get image metadata filtered for keywords. Output is an array of keywords
  let exifData = await exifr
    .parse(filePath, { iptc: true, xmp: true })
    .catch(console.error);
  // console.log("exifData.ImageWidth", exifData.ImageWidth);
  let keywordsArray = [];
  if (exifData) {
    keywordsArray = exifData.Keywords;
  }

  let analogMetadata = {};
  if (exifData.Instructions) {
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

  let toRemove = new Set(
    [].concat(
      analogMetadata.camera,
      analogMetadata.lens,
      analogMetadata.film,
      peopleArray
    )
  );

  let filteredKeywords = [
    ...new Set(keywordsArray.filter((x) => !toRemove.has(x))),
  ];

  let colorObject = await getAverageColor(filePath, {
    algorithm: "dominant",
  }).catch(console.error);
  // console.log(imageSrc, colorObject);

  return new Promise((resolve, reject) => {
    // build object for image with relevent data for ifCloudinary
    let imageData = {
      file: fileName,
      imageSrc: filePath,
      altText: exifData.Caption,
      name: path.basename(filePath, path.extname(filePath)),
      path: filePath,
      album: path.basename(path.dirname(filePath)),
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

    resolve(imageData);
  });
};

/* async function run(){
    let data = await getFileData("./image_upload");
    console.log("data", await data);
}

run(); */
