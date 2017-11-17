module.exports = {
  src: "src/main.js",
  dest: "dist/main.js",
  multiprocess: 2,

  bundler: [
    ["bit-bundler-splitter", [
      { name: "vendor", dest: "dist/vendor.js", match: { path: /\/node_modules\// } },
      { name: "renderer", dest: "dist/renderer.js", match: { path: /\/src\/renderer\// } },
      { name: "other.js", dest: "dist/other.js", match: { fileName: "other.js" } }]
    ]
  ]
};
