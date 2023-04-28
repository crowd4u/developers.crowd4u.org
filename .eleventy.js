const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

    eleventyConfig.addPassthroughCopy("**/*.png");
    //eleventyConfig.addPassthroughCopy("assets/img/**/*.png");

    eleventyConfig.addFilter("getAllTags", collection => {
        let tagset = new Set();
        collection.forEach(post => {
            (post.data.tags || []).forEach(tag => tagset.add(tag))
        });
        return Array.from(tagset);
    });

    eleventyConfig.addFilter("filterTagList", tags => {
        return (tags || []).filter(tag => ["posts"].indexOf(tag) === -1);
    });

    eleventyConfig.addFilter("filterAuthor", (collections, author) => {
        collections.filter(post => post.data.author === author)
    });

    eleventyConfig.addShortcode("author_link", (id, text) => {
        let path = "/author/" + eleventyConfig.getFilter("slugify")(id);
        return `<a href="${eleventyConfig.getFilter("htmlBaseUrl")(path)}">${text}</a>`;
    });

    eleventyConfig.addShortcode("tag_link", (tag) => {
        let path = "/tag/" + eleventyConfig.getFilter("slugify")(tag);
        return `<a href="${eleventyConfig.getFilter("htmlBaseUrl")(path)}">${tag}</a>`;
    });

    return {
        markdownTemplateEngine: "njk",
        dir: {
            input: "src",
            output: "public"
        }
    }
}