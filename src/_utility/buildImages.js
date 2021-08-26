const { readdirSync, readdir } = require("fs");
const path = require("path");
const { makeImageMd } = require("./makeImageMd");

var dirPath = "src/testassets";
const EXTENSION = '.jpg';

const files = readdirSync(dirPath);

var imageFiles = files.filter(file => { return path.extname(file).toLowerCase() === EXTENSION; });

var imagePaths = imageFiles.map(file => dirPath + '/' + file);
console.log(imagePaths);

for (file of imagePaths) {
    makeImageMd(file, "src/testgallery/")
};



// makeImageMd()
