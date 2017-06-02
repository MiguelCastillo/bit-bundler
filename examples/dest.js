var Bitbundler = require("bit-bundler");
var splitBundle = require("bit-bundler-splitter");

var bitbundler = new Bitbundler({
  loader: [
    "bit-loader-js",
    "bit-loader-babel"
  ],
  bundler: [
    splitBundle("dest/dest-renderer.js", { match: { path: /src\/renderer/ } }),
    splitBundle("dest/dest-other.js", { match: { fileName: "other.js" } })
  ]
});

bitbundler
  .bundle("src/main.js")
  .then(Bitbundler.dest("dest/dest-main.js"));
