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

    eleventyConfig.addFilter("getAuthorLink", (id) => {
        let path = `/author/${id}`;
        return eleventyConfig.getFilter("url")(path);
    });

    eleventyConfig.addFilter("getAuthorAvatarLink", (id) => {
        let path = `/assets/img/avatars/${id}.png`;
        return eleventyConfig.getFilter("url")(path);
    });

    eleventyConfig.addFilter("getTagLink", (tag) => {
        let path = "/tag/" + eleventyConfig.getFilter("slugify")(tag);
        return eleventyConfig.getFilter("url")(path);
    });

    return {
        markdownTemplateEngine: "njk",
        dir: {
            input: "src",
            output: "public"
        }
    }
}