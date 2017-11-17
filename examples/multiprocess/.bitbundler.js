module.exports = {
  // Enable multiprocess for parallel dependency processing
  multiprocess: true,
  src: "src/main.js",
  dest: "dist/main.js",

  bundler: [
    ["bit-bundler-splitter", [
      { name: "vendor", dest: "dist/vendor.js", match: { path: /\/node_modules\// } },
      { name: "renderer", dest: "dist/renderer.js", match: { path: /\/src\/renderer\// } },
      { name: "other.js", dest: "dist/other.js", match: { fileName: "other.js" } }]
    ]
  ]
};
