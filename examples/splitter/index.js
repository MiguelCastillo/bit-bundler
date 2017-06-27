var Bitbundler = require("bit-bundler");
var splitBundle = require("bit-bundler-splitter");

var bitbundler = new Bitbundler({
  loader: [
    "bit-loader-js",
    "bit-loader-babel"
  ],
  bundler: [
    splitBundle("vendor", { match: { path: /\/node_modules\// }, dest: "dest/vendor.js" }),
    splitBundle("renderer", { match: { path: /\/src\/renderer\// }, dest: "dest/renderer.js" })
  ]
});

bitbundler.bundle({
  src: "src/main.js",
  dest: "dest/main.js"
});
