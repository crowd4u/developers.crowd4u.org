const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const pluginTOC = require("eleventy-plugin-toc");
const pluginRSS = require("@11ty/eleventy-plugin-rss");

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin, {
        baseHref: (process.env.NODE_ENV === "production" ? "https://developers.crowd4u.org" : "http://localhost:8080")
    });
    eleventyConfig.addPlugin(pluginTOC, {
        tags: ["h2", "h3", "h4"],
        wrapper: "aside"
    });
    eleventyConfig.addPlugin(pluginRSS);

    eleventyConfig.setLibrary(
        "md",
        markdownIt().use(markdownItAnchor)
    );

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
        return collections.filter(post => post.data.author === author);
    });

    eleventyConfig.addFilter("readableDate", (date) => {
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    })

    eleventyConfig.addFilter("dateToRfc3339", pluginRSS.dateToRfc3339);

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