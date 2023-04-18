const dirTree = require("directory-tree");
const dotenv = require("dotenv");
dotenv.config();

//console.log(dirTree("./image_upload", { exclude: /\.DS_Store/ }));

module.exports = function () {
  // return await getFileData("./image_upload");
  let data = dirTree(process.env.IMAGE_PATH, {
    attributes: ["size", "type", "extension"],
    exclude: /\.DS_Store/,
  });
  return data;
};
