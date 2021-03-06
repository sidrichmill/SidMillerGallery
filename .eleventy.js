const { shuffle } = require("./src/_utility/shuffle.js");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/style");
  eleventyConfig.addPassthroughCopy("./src/assets");
  eleventyConfig.addPassthroughCopy("./src/js");

  // eleventyConfig.addNunjucksShortcode("slider", function(currentImage, imageList) {

  //  });

  //collections
  // tags
  // images
  // roll albums
  // tag albums

  // eleventyConfig.addCollection("keywords", function (collection) {
  //   //console.log(collection.getAll());
  //   return collection.getAll().filter((post) => {
  //     return "keywords" in post.data;
  //   });
  // });

  eleventyConfig.addFilter("shuffle", function (array) {
    return shuffle(array);
  });

  eleventyConfig.addFilter("limit", function (array, limit) {
    return array.slice(0, limit);
  });

  eleventyConfig.addFilter("typeof", function (object) {
    return typeof object;
  });

  return {
    dir: {
      input: "src",
      output: "public",
    },
  };
};
