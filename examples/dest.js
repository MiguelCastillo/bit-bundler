var Bitbundler = require("bit-bundler");
var jsPlugin = require("bit-loader-js");
var babelPlugin = require("bit-loader-babel");
var splitBundle = require("bit-bundler-splitter");

var bitbundler = new Bitbundler({
  loader: {
    plugins: [
      jsPlugin(),
      babelPlugin()
    ]
  },
  bundler: {
    plugins: [
      splitBundle("dest/dest-renderer.js", { match: { path: /src\/renderer/ } }),
      splitBundle("dest/dest-other.js", { match: { fileName: "other.js" } })
    ]
  }
});

bitbundler
  .bundle("src/main.js")
  .then(Bitbundler.dest("dest/dest-main.js"));
