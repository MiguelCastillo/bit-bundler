module.exports = {
  src: "src/main.js",
  dest: "dest/main.js",

  loader: [
    "bit-loader-js"
  ],
  bundler: [
    ["bit-bundler-splitter", { name: "vendor", match: { path: /\/node_modules\// }, dest: "dest/vendor.js" }],
    ["bit-bundler-splitter", { name: "renderer", match: { path: /\/src\/renderer\// }, dest: "dest/renderer.js" }],
    ["bit-bundler-splitter", { name: "other.js", match: { fileName: "other.js" }, dest: "dest/other.js" }]
  ]
};
