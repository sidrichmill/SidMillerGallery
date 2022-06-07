const dirTree = require("directory-tree");

//console.log(dirTree("./image_upload", { exclude: /\.DS_Store/ }));

module.exports = function () {
  // return await getFileData("./image_upload");
  let data = dirTree("./image_upload", {
    attributes: ["size", "type", "extension"],
    exclude: /\.DS_Store/,
  });
  return data;
};
