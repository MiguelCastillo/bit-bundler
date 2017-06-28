var Bitbundler = require("bit-bundler");
var splitBundle = require("bit-bundler-splitter");

var bitbundler = new Bitbundler({
  // Enable multiprocess for parallel dependency processing
  multiprocess: true,

  loader: [
    "bit-loader-js"
  ],
  bundler: [
    splitBundle("vendor", { match: { path: /\/node_modules\// }, dest: "dest/vendor.js" }),
    splitBundle("renderer", { match: { path: /\/src\/renderer\// }, dest: "dest/renderer.js" }),
    splitBundle("other.js", { match: { fileName: "other.js" }, dest: "dest/other.js" })
  ]
});

bitbundler.bundle({
  src: "src/main.js",
  dest: "dest/main.js"
});
