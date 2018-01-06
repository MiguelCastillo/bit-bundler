module.exports = {
  src: "src/main.js",
  dest: "dist/main.js",
  multiprocess: 2,

  loader: [
    "bit-loader-babel"
  ],

  bundler: [
    ["bit-bundler-splitter", [
      { name: "vendor", dest: "dist/vendor.js", match: "/node_modules/" },
      { name: "renderer", dest: "dist/renderer.js", match: "/src/renderer" }
    ]]
  ]
};
