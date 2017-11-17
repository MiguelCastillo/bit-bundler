module.exports = {
  // multiprocess: true,
  src: "src/main.js",
  dest: "dist/main.js",

  loader: [
    "bit-loader-babel"
  ],
  bundler: [
    ["bit-bundler-splitter", [
      { name: "vendor", dest: "dist/vendor.js", match: { path: /\/node_modules\// } },
      { name: "renderer", dest: "dist/renderer.js", match: { path: /\/src\/renderer\// } },
      { name: "other.js", dest: "dist/other.js", match: { filename: "other.js" } }]
    ],
    "bit-bundler-minifyjs",
    ["bit-bundler-extractsm", {
      vendor: false
    }]
  ]
};
