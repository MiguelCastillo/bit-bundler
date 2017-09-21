module.exports = {
  // Enable multiprocess for parallel dependency processing
  multiprocess: true,
  src: "src/main.js",
  dest: "dest/main.js",

  bundler: [
    ["bit-bundler-splitter", { name: "vendor", dest: "dest/vendor.js", match: { path: /\/node_modules\// } }],
    ["bit-bundler-splitter", { name: "renderer", dest: "dest/renderer.js", match: { path: /\/src\/renderer\// } }],
    ["bit-bundler-splitter", { name: "other.js", dest: "dest/other.js", match: { fileName: "other.js" } }]
  ]
};
