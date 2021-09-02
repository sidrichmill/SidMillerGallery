const del = require('del');
var justifiedLayout = require('justified-layout')

module.exports = function(eleventyConfig) {

    eleventyConfig.addPassthroughCopy('./src/style');
    eleventyConfig.addPassthroughCopy('./src/assets');
    eleventyConfig.addPassthroughCopy('./src/admin');
    eleventyConfig.addPassthroughCopy('./src/js');

   // eleventyConfig.addShortcode("justifiedLayout", justifiedLayout(input, config)); // {{ justifiedLayout input, config }}


    eleventyConfig.addCollection("detailsCollection", function (collection) {
        // console.log(collection.getAll());
        return collection.getAll().filter((post) => post.data.details);
      });


    return {
        dir: {
            input: "src",
            output: "public"
        }
    };
}

