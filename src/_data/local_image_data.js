const path = require("path");
const exifr = require("exifr");
const { getAverageColor } = require("fast-average-color-node");
const { promisify } = require("util");
const sizeOf = promisify(require("image-size"));
const { resolve } = require("path");
const { readdir } = require("fs").promises;
const { statSync } = require("fs");

//library for dealing with time
const { DateTime } = require("luxon");
const now = DateTime.now();

//library for caching simple key/value pairs
const flatCache = require("flat-cache");
var cache = flatCache.load(
  "image-data-cache",
  resolve("D:\\Programming\\SidMillerGallery\\src\\_cache")
);
//console.log("Cached Data ", cache.all());

//makes environmental variables availible
const dotenv = require("dotenv");
const { mainModule } = require("process");
const { maxHeaderSize } = require("http");
dotenv.config();

let breakCache = false;
let args = process.argv.slice(2);

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  let filteredDirents = dirents.filter(
    (dirent) => !dirent.name.startsWith("_")
  );
  // console.log("ParentDir", dir);
  // console.log("filteredDirents", filteredDirents);
  const files = await Promise.all(
    filteredDirents.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );
  let EXTENSION = ".jpg";
  return files
    .flat()
    .filter((file) => {
      return path.extname(file).toLowerCase() === EXTENSION;
    })
    .filter(hasChanged);
  //.filter(tobreakCache || hasChanged);
}

async function getFileData(baseDir) {
  let fileList = await getFiles(baseDir).catch((e) =>
    console.error("Error from getFiles:" + e)
  );
  console.log("Number of files being analyzed:", fileList.length);
  return Promise.all(
    fileList.map((image) => {
      let imageData = getImageData(image);
      //console.log("imageData", imageData);
      return imageData;
    })
  );
}

async function getImageData(filePath) {
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
  if (exifData.Keywords) {
    keywordsArray = [exifData.Keywords].flat();
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

  let peopleArray = [];

  if (exifData.PersonInImage) {
    peopleArray = [exifData.PersonInImage].flat();
  }

  // typeof exifData.PersonInImage == "object"
  //   ? exifData.PersonInImage
  //   : typeof exifData.PersonInImage == "string"
  //   ? [exifData.PersonInImage]
  //   : exifData.PersonInImage;

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

  let altText = "altText";

  return new Promise((resolve, reject) => {
    // build object for image with relevent data for ifCloudinary
    let imageData = {
      file: fileName,
      imageSrc: filePath,
      generatedTime: now.toISO(),
      altText: exifData.Caption || "",
      name: path.basename(filePath, path.extname(filePath)),
      path: filePath,
      album: path.basename(path.dirname(filePath)),
      rating: exifData.Rating || 0,
      tags: [exifData.Keywords].flat(),
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
    cache.setKey(filePath, imageData);
    // console.log(imageData);
    resolve(imageData);
  });
}

function hasChanged(file) {
  let fileStat = statSync(file);
  let birthTime = DateTime.fromJSDate(fileStat.birthtime);
  let changeTime = DateTime.fromJSDate(fileStat.ctime);
  let modTime = DateTime.fromJSDate(fileStat.mtime);

  let lastTime = DateTime.fromISO(cache.getKey(file).generatedTime);
  // console.log("lastTime", lastTime.toLocaleString(DateTime.DATETIME_FULL));
  // console.log("birthTime", birthTime.toLocaleString(DateTime.DATETIME_FULL));
  // console.log("changeTime", changeTime.toLocaleString(DateTime.DATETIME_FULL));
  // console.log("modTime", modTime.toLocaleString(DateTime.DATETIME_FULL));

  // console.log(lastTime < Math.max(birthTime, changeTime, modTime));
  return lastTime < Math.max(birthTime, changeTime, modTime);
}

function tobreakCache() {
  // console.log("tobreakCache function returns:", breakCache);
  return breakCache;
}

const testPath =
  "D:\\Photos\\LightroomCollectionPublish\\Film Rolls TIFFS\\220220_Kiii_GOLD_200+1\\220220_Kiii_GOLD_200+1_001.jpg";
//run();
//getfileStat(testPath);
//cacheData(testPath);
// hasChanged(testPath);
async function run(breaker = false) {
  // return await getFileData("./image_upload");
  if (breaker) {
    console.log("Breaking Cache...");
    breakCache = true;
  } else {
    breakCache = false;
  }
  await getFileData(process.env.IMAGE_PATH);
  cache.save(true);
  let data = Object.values(cache.all());
  console.log(data[0]);
  return data;
}

module.exports = run;

if (args[0]) {
  run(args[1]);
}
