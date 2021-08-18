require('dotenv').config();

module.exports = function(eleventyConfig) {

    eleventyConfig.addPassthroughCopy('./src/style');
    eleventyConfig.addPassthroughCopy('./src/assets');
    eleventyConfig.addPassthroughCopy('./src/admin');


    return {
        dir: {
            input: "src",
            output: "public"
        }
    };
}