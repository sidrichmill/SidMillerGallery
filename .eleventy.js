const del = require('del');

module.exports = function(eleventyConfig) {

    const dirToClean = 'public/*';
    del(dirToClean);

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

