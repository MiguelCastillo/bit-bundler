var Bitbundler = require("bit-bundler");
var splitBundle = require("bit-bundler-splitter");

var bitbundler = new Bitbundler({
  loader: [
    "bit-loader-js",
    "bit-loader-babel"
  ],
  bundler: [
    splitBundle("dest/splitter-vendor.js", { match: { path: /\/node_modules\// } }),
    splitBundle("dest/splitter-renderer.js", { match: { path: /src\/renderer/ } })
  ]
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/splitter-main.js"
  });
