const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    return {
        dir: {
            input: "src",
            output: "public"
        }
    }
}