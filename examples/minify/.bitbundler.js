module.exports = {
  // multiprocess: true,
  src: "src/main.js",
  dest: "dest/main.js",

  loader: [
    "bit-loader-babel"
  ],
  bundler: [
    ["bit-bundler-splitter", [
      { name: "vendor", dest: "dest/vendor.js", match: { path: /\/node_modules\// } },
      { name: "renderer", dest: "dest/renderer.js", match: { path: /\/src\/renderer\// } },
      { name: "other.js", dest: "dest/other.js", match: { filename: "other.js" } }]
    ],
    "bit-bundler-minifyjs",
    ["bit-bundler-extractsm", {
      vendor: false
    }]
  ]
};
