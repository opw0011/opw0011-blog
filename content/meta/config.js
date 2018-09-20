const colors = require("../../src/styles/new-colors");

module.exports = {
  siteTitle: "Benny O", // <title>
  shortSiteTitle: "PersonalBlog GatsbyJS Starter", // <title> ending for posts and pages
  siteDescription: "PersonalBlog is a GatsbyJS starter.",
  siteUrl: "https://gatsby-starter-personal-blog.greglobinski.com",
  // pathPrefix: "/opw0011-blog",
  pathPrefix: "",
  siteImage: "preview.jpg",
  siteLanguage: "en",
  // author
  authorName: "Benny O",
  authorTwitterAccount: "greglobinski",
  // info
  infoTitle: "Benny O",
  infoTitleNote: "personal blog",
  // manifest.json
  manifestName: "PersonalBlog - a blog starter for GatsbyJS",
  manifestShortName: "PersonalBlog", // max 12 characters
  manifestStartUrl: "/",
  manifestBackgroundColor: colors.background,
  manifestThemeColor: colors.background,
  manifestDisplay: "standalone",
  // contact
  contactEmail: "opw0011@gmail.com",
  // social
  authorSocialLinks: [
    { name: "github", url: "https://github.com/opw0011" },
    { name: "linkedin", url: "https://www.linkedin.com/in/benny-o" }
  ]
};
