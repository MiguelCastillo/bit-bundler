module.exports = {
  src: "src/main.js",
  dest: "dist/main.js",

  loader: [
    "@bit/loader-babel"
  ],

  bundler: [
    ["@bit/bundler-splitter", [
      { name: "vendor", dest: "dist/vendor.js", match: "/node_modules/" },
      { name: "renderer", dest: "dist/renderer.js", match: "/src/renderer" },
      { name: "other.js", dest: "dist/other.js", match: { fileName: "other.js" } }
    ]]
  ]
};
