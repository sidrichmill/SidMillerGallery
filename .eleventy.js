module.exports = function(eleventyConfig) {

    eleventyConfig.addPassthroughCopy('./src/style');
    eleventyConfig.addPassthroughCopy('./src/assets');
    eleventyConfig.addPassthroughCopy('./src/js');


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

