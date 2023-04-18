const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    eleventyConfig.addPassthroughCopy("**/*.png");

    eleventyConfig.addFilter("getAllTags", collection => {
        let tagset = new Set();
        collection.forEach(post => {
            (post.data.tags || []).forEach(tag => tagset.add(tag))
        });
        return Array.from(tagset);
    });

    eleventyConfig.addFilter("filterTagList", tags => {
        return (tags || []).filter(tag => ["posts"].indexOf(tag) === -1);
    })

    return {
        dir: {
            input: "src",
            output: "public"
        }
    }
}